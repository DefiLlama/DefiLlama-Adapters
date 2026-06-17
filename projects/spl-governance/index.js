const { PublicKey } = require('@solana/web3.js')
let bs58 = require('bs58'); if (bs58.default) bs58 = bs58.default
const { getConnection, sumTokens2 } = require('../helper/solana')
const { sliceIntoChunks, sleep } = require('../helper/utils')
const { getCache } = require('../helper/http')

// SPL Governance program instances that hold Realms DAO treasuries.
// Same set the protocol's own TVL service tracks (https://realms.today / spl-governance deployments).
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
const SOL = 'So11111111111111111111111111111111111111112'
const isSolOrStable = (symbol) => ['sol', 'usd', 'btc', 'eth'].some(k => (symbol || '').toLowerCase().includes(k))

// Treasuries hold assets in the governance's native-treasury PDA (seeds: ['native-treasury', governance])
function nativeTreasury(programId, governance) {
  return PublicKey.findProgramAddressSync([Buffer.from('native-treasury'), governance.toBuffer()], programId)[0]
}

let statePromise
function getState() {
  if (!statePromise) statePromise = computeState()
  return statePromise
}

// getProgramAccounts on busy governance programs can transiently overload an RPC's
// account index; retry with backoff. Only pubkeys are needed, so data is sliced out.
async function getGovernanceAccounts(connection, programId, discriminator) {
  const params = {
    dataSlice: { offset: 0, length: 0 },
    filters: [{ memcmp: { offset: 0, bytes: bs58.encode(Buffer.from([discriminator])) } }],
  }
  for (let attempt = 0; ; attempt++) {
    try {
      return await connection.getProgramAccounts(programId, params)
    } catch (e) {
      if (attempt >= 4) throw e
      await sleep(3000 * (attempt + 1))
    }
  }
}

async function computeState() {
  const connection = getConnection()

  // 1. Enumerate every governance across all program instances, derive its native treasury PDA
  const owners = new Set()
  for (const program of GOV_PROGRAMS) {
    const programId = new PublicKey(program)
    try {
      for (const discriminator of GOVERNANCE_DISCRIMINATORS) {
        const accounts = await getGovernanceAccounts(connection, programId, discriminator)
        for (const { pubkey } of accounts)
          owners.add(nativeTreasury(programId, pubkey).toString())
        await sleep(250)
      }
    } catch (e) {
      // A few legacy program instances have account indexes too large for a plain
      // getProgramAccounts (RPCs ask for paginated getProgramAccountsV2); they hold
      // negligible treasury value, so skip them. Any other error propagates.
      if (!/getProgramAccountsV2|account index|overloaded|too large/i.test(e.message)) throw e
      console.error(`spl-governance: skipping program ${program} (account set too large to enumerate):`, e.message)
    }
  }
  const ownerList = [...owners]

  // 2. SPL token balances held by those treasuries
  const balances = {}
  await sumTokens2({ balances, owners: ownerList, chain: 'solana' })

  // 3. Native SOL held by those treasuries. Kept as a separate number: sumTokens2 stores
  //    balance values as strings, so adding lamports into that object would concatenate.
  let solLamports = 0
  for (const chunk of sliceIntoChunks(ownerList, 100)) {
    const infos = await connection.getMultipleAccountsInfo(chunk.map(o => new PublicKey(o)))
    for (const info of infos) solLamports += info?.lamports || 0
  }

  // 4. Split token holdings by kind: SOL/stables/BTC/ETH count as TVL, governance tokens as staking
  const mints = Object.keys(balances).map(k => k.replace('solana:', ''))
  const symbols = await getSymbols(mints)
  const tvlBalances = {}, stakingBalances = {}
  for (const key of Object.keys(balances)) {
    const mint = key.replace('solana:', '')
    const bucket = isSolOrStable(symbols[mint]) ? tvlBalances : stakingBalances
    bucket[key] = balances[key]
  }
  return { tvlBalances, stakingBalances, solLamports }
}

async function getSymbols(mints) {
  const symbols = {}
  for (const chunk of sliceIntoChunks(mints, 50)) {
    const keys = chunk.map(m => `solana:${m}`).join(',')
    const { coins = {} } = await getCache(`https://coins.llama.fi/prices/current/${keys}`)
    for (const m of chunk) symbols[m] = coins[`solana:${m}`]?.symbol
  }
  return symbols
}

async function tvl(api) {
  const { tvlBalances, solLamports } = await getState()
  for (const [key, amount] of Object.entries(tvlBalances)) api.add(key.replace('solana:', ''), amount)
  if (solLamports > 0) api.add(SOL, solLamports) // native SOL counts as TVL
}

async function staking(api) {
  const { stakingBalances } = await getState()
  for (const [key, amount] of Object.entries(stakingBalances)) api.add(key.replace('solana:', ''), amount)
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'Enumerates DAO treasuries across the SPL Governance program instances on-chain and sums their holdings. SOL, stables, BTC and ETH held in the treasuries are counted under TVL; governance tokens are counted under staking.',
  timetravel: false,
  solana: { tvl, staking },
}
