const { PublicKey } = require('@solana/web3.js')
let bs58 = require('bs58'); if (bs58.default) bs58 = bs58.default
const { getConnection } = require('../helper/solana')
const { queryAllium } = require('../helper/allium')
const { sliceIntoChunks, sleep } = require('../helper/utils')

// SPL Governance program instances that hold Realms DAO treasuries.
const GOV_PROGRAMS = [
  'GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw',
  'gUAedF544JeE6NYbQakQvribHykUNgaPJqcgf3UQVnY',
  'GqTPL6qRf5aUuqscLh8Rg2HTxPUXfhhAXDptTLhp1t2J',
  'DcG2PZTnj8s4Pnmp7xJswniCskckU5E6XsrKuyD7NYFK',
  'AEauWRrpn9Cs6GXujzdp1YhMmv2288kBt3SdEcPYEerr',
  'G41fmJzd29v7Qmdi8ZyTBBYa98ghh3cwHBTexqCG1PQJ',
  'GovHgfDPyQ1GwazJTDY2avSVY8GGcpmCapmmCsymRaGe',
  'pytGY6tWRgGinSCvRLnSv4fHfBTMoiDGiCsesmHWM6U',
  'J9uWvULFL47gtCPvgR3oN7W357iehn5WF2Vn9MJvcSxz',
  'JPGov2SBA6f7XSJF5R4Si5jEJekGiyrwP2m7gSEqLUs',
  'Ghope52FuF6HU3AAhJuAAyS2fiqbVhkAotb7YprL5tdS',
  '5sGZEdn32y8nHax7TxEyoHuPS3UXfPWtisgm8kqxat8H',
  'smfjietFKFJ4Sbw1cqESBTpPhF4CwbMwN8kBEC1e5ui',
  'GovMaiHfpVPw8BAM1mbdzgmSZYDw2tdP32J2fapoQoYs',
  'GCockTxUjxuMdojHiABVZ5NKp6At8eTKDiizbPjiCo4m',
  'HT19EcD68zn7NoCF79b2ucQF8XaMdowyPt5ccS6g1PUx',
  'GRNPT8MPw3LYY6RdjsgKeFji5kMiG1fSxnxDjDBu4s73',
  'ALLGnZikNaJQeN4KCAbDjZRSzvSefUdeTpk18yfizZvT',
  'A7kmu2kUcnQwAVn8B4znQmGJeUrsJ1WEhYVMtmiBLkEr',
  'MGovW65tDhMMcpEmsegpsdgvzb6zUwGsNjhXFxRAnjd',
  'jdaoDN37BrVRvxuXSeyR7xE5Z9CAoQApexGrQJbnj6V',
  'GMnke6kxYvqoAXgbFGnu84QzvNHoqqTnijWSXYYTFQbB',
  'hgovkRU6Ghe1Qoyb54HdSLdqN7VtxaifBzRmh9jtd3S',
  'jtogvBNH3WBSWDYD5FJfQP2ZxNTuf82zL8GkEhPeaJx',
  'dgov7NC8iaumWw3k8TkmLDybvZBCmd1qwxgLAGAsWxf',
]

// GovernanceAccountType discriminators that own treasuries:
// V1 Governance/ProgramGovernance/MintGovernance/TokenGovernance = 3,4,9,10; V2 = 18,19,20,21
const GOVERNANCE_DISCRIMINATORS = [3, 4, 9, 10, 18, 19, 20, 21]
const isSolOrStable = (symbol) => ['sol', 'usd', 'btc', 'eth'].some(k => (symbol || '').toLowerCase().includes(k))

// Treasuries hold assets in the governance's native-treasury PDA (seeds: ['native-treasury', governance])
function nativeTreasury(programId, governance) {
  return PublicKey.findProgramAddressSync([Buffer.from('native-treasury'), governance.toBuffer()], programId)[0]
}

// getProgramAccounts is rate-limited / can transiently fail on shared RPCs. Retry with backoff.
// A genuinely un-enumerable program (index too large -> getProgramAccountsV2) is re-thrown so
// the caller can skip it.
async function getGovernanceAccounts(connection, programId, discriminator) {
  const params = {
    dataSlice: { offset: 0, length: 0 },
    filters: [{ memcmp: { offset: 0, bytes: bs58.encode(Buffer.from([discriminator])) } }],
  }
  for (let attempt = 0; ; attempt++) {
    try {
      return await connection.getProgramAccounts(programId, params)
    } catch (e) {
      const msg = e.message || ''
      if (/getProgramAccountsV2|account index|too large/i.test(msg)) throw e // un-enumerable -> skip
      if (attempt >= 6) throw e
      await sleep(4000 * (attempt + 1)) // transient (429 / network) -> back off
    }
  }
}

// Enumerate every governance across all program instances (sequentially, to stay under RPC rate
// limits), derive its native treasury PDA.
async function getTreasuryOwners() {
  const connection = getConnection()
  const owners = new Set()
  for (const program of GOV_PROGRAMS) {
    const programId = new PublicKey(program)
    try {
      for (const discriminator of GOVERNANCE_DISCRIMINATORS) {
        const accounts = await getGovernanceAccounts(connection, programId, discriminator)
        for (const { pubkey } of accounts)
          owners.add(nativeTreasury(programId, pubkey).toString())
        await sleep(300)
      }
    } catch (e) {
      // A few legacy program instances have account indexes too large for a plain
      // getProgramAccounts; they hold negligible treasury value, so skip them.
      if (!/getProgramAccountsV2|account index|too large/i.test(e.message)) throw e
      console.error(`spl-governance: skipping program ${program} (account set too large to enumerate):`, e.message)
    }
  }
  return [...owners]
}

let statePromise
function getState() {
  if (!statePromise) statePromise = computeState().catch(e => { statePromise = undefined; throw e })
  return statePromise
}

async function computeState() {
  const owners = await getTreasuryOwners()

  // Sum treasury holdings (SOL + SPL) from Allium's daily balance snapshots, in chunks to keep
  // each query small. The inner subquery pins each chunk to its latest available snapshot date.
  let tvlUsd = 0, stakingUsd = 0
  for (const chunk of sliceIntoChunks(owners, 500)) {
    const list = chunk.map(a => `'${a}'`).join(', ')
    const sql = `
      SELECT token_symbol, SUM(usd_amount) AS usd_amount
      FROM solana.assets.balances_daily
      WHERE date = (SELECT MAX(date) FROM solana.assets.balances_daily WHERE address IN (${list}))
        AND address IN (${list})
        AND usd_amount > 0
      GROUP BY token_symbol`
    const rows = await queryAllium(sql)
    for (const { token_symbol, usd_amount } of rows) {
      if (isSolOrStable(token_symbol)) tvlUsd += Number(usd_amount) || 0
      else stakingUsd += Number(usd_amount) || 0
    }
  }
  return { tvlUsd, stakingUsd }
}

async function tvl(api) {
  const { tvlUsd } = await getState()
  api.addUSDValue(tvlUsd)
}

async function staking(api) {
  const { stakingUsd } = await getState()
  api.addUSDValue(stakingUsd)
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'Enumerates DAO treasuries across the SPL Governance program instances on-chain, then sums their holdings from the latest Allium daily balance snapshot. SOL, stables, BTC and ETH held in the treasuries are counted under TVL; governance tokens under staking.',
  timetravel: false,
  solana: { tvl, staking },
}
