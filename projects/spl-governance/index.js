const ADDRESSES = require('../helper/coreAssets.json')
const { PublicKey } = require('@solana/web3.js')
const { bs58 } = require('@project-serum/anchor/dist/cjs/utils/bytes');
const sdk = require('@defillama/sdk')
const { getConnection, sumTokens2 } = require('../helper/solana')
const { sleep } = require('../helper/utils')

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

const TVL_MINTS = new Set([
  ADDRESSES.solana.SOL, ADDRESSES.solana.bSOL, ADDRESSES.solana.JupSOL, ADDRESSES.solana.JitoSOL, // SOL + LSTs
  ADDRESSES.solana.USDC, ADDRESSES.solana.USDT, ADDRESSES.solana.DAI, ADDRESSES.solana.PYUSD, // stablecoins
  "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs", "cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij", // WETH + BTC
].map((mint) => `solana:${mint}`))

const ERRORS = /getProgramAccountsV2|too large|scan results exceeded/i

// Treasuries hold assets in the governance's native-treasury PDA (seeds: ['native-treasury', governance])
function nativeTreasury(programId, governance) {
  return PublicKey.findProgramAddressSync([Buffer.from('native-treasury'), governance.toBuffer()], programId)[0]
}

async function getGovernanceAccounts(connection, programId, discriminator) {
  const params = {
    dataSlice: { offset: 0, length: 0 },
    filters: [{ memcmp: { offset: 0, bytes: bs58.encode(Buffer.from([discriminator])) } }],
  }
  for (let attempt = 0; ; attempt++) {
    try {
      return await connection.getProgramAccounts(programId, params)
    } catch (e) {
      if (ERRORS.test(e.message || '')) return null
      if (attempt >= 5) throw e
      await sleep(3000 * (attempt + 1))
    }
  }
}

async function getTreasuryOwners() {
  const connection = getConnection()
  const owners = new Set()
  for (const program of GOV_PROGRAMS) {
    const programId = new PublicKey(program)
    for (const discriminator of GOVERNANCE_DISCRIMINATORS) {
      const accounts = await getGovernanceAccounts(connection, programId, discriminator)
      if (accounts === null) continue
      for (const { pubkey } of accounts) owners.add(nativeTreasury(programId, pubkey).toString())
      await sleep(300)
    }
  }
  return [...owners]
}

let state
function getState() {
  if (state) return state
  state = (async () => {
    const owners = await getTreasuryOwners()

    const balances = {}
    await sumTokens2({ balances, owners, solOwners: owners })

    const tvl = {}, staking = {}
    for (const [key, amount] of Object.entries(balances)) {
      if (TVL_MINTS.has(key)) tvl[key] = amount
      else staking[key] = amount
    }
    return { tvl, staking }
  })().catch(e => { state = undefined; throw e })
  return state
}

async function tvl(api) {
  const { tvl } = await getState()
  api.addBalances(tvl)
}

async function staking(api) {
  const { staking } = await getState()
  api.addBalances(staking)
}

module.exports = {
  methodology: 'Enumerates DAO treasuries across the SPL Governance programs, then reads each treasury\'s SOL and SPL token balances directly from the chain. SOL (including liquid-staked SOL) and stablecoins are counted under TVL; all other tokens (governance and otherwise) under staking. Programs whose account set is too large for the RPC to scan (e.g. Pyth) are skipped.',
  timetravel: false,
  solana: { tvl, staking },
}
