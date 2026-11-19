const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const USDC = ADDRESSES.base.USDC
const WETH = ADDRESSES.optimism.WETH_1
const KAL = '0xe99556D5594faf533fcB346A8a9B11259D29afA8'

// KalPool strategy vaults, generations V5_1_4, V5_2_0 and V5_2_2 (all live during the migration)
const VAULTS = [
  // V5_1_4
  '0x96869F08F5B5C52664c9620269394eFF4efd065b', // HORIZON
  '0x6dd6e7A6154293b22Dcd5d07d8f61F446646B15d', // VALKYRIE
  '0x9A9990fdFf702f7aEd10f873eeD2baB60e493038', // REVOLUTION
  '0x03FEC25393C38cC5DE1F2D2DB620b8478cAC4Ae0', // TREASURY
  '0x55F8D85749EA9C374b3aBFaEF7B07429546F6A97', // ORION
  // V5_2_0
  '0xd647F01EDb2e327E4928F84C1be05eaC83c29326',
  '0xeC0F2B417741BF827d7ead53f0a9722847b6aB2d',
  '0xC04A2FbE7816Db5bF33b45D25c0F813b2BF67717',
  '0x887e1787684879Ab4Aa3544C4eAeA394E8da8dBf', // REVOLUTION
  '0xf5aC77495227741CeB696d43Cd0fD4Ed83F73Bf8', // TREASURY
  '0x9b87C7075ca523a160F6e9657dDEedb263CFa3c2', // ORION
  '0x7393819B67A4f70C307831B114Ca5f5e224bebF1',
  // V5_2_2
  '0x6bDdFAA9Fe728bEee4A14FD64F7C770490A42654', // HORIZON
  '0xAb1825cB888c88a283518905f7981C3b2E158bD8', // VALKYRIE
  '0xB502e605804d03c45Ea8a7f73814Fd3efcB2975d', // REVOLUTION
  '0xeCf3c5963B3514714F9d6bDC3F481EB8e4007Aa9', // TREASURY
  '0x04495A5F602fad117cC39806603c95D458De405E', // ORION
  '0x9455fFC22D84031BAf05f3091DB4FF6e48722F77', // GENESIS
]

// KalSwap USDC/WETH market: not farmed with KAL, counted as tvl
const USDC_WETH_PAIR = '0x83c26f5C90B81adDf50845CCFCdcd02B819ADeB5'

// KalSwap markets paired with KAL, farmed in LiquidityRewards: pool2
const KAL_PAIRS = [
  '0x3315E6E788E2B30aF8f4c35124695E60D510c31B', // KAL/USDC, KalSwap V2
  '0x1FaC3B6a11C441Dd1535deB4c1140a7D01fB8E98', // KAL/USDC, KalSwap V3
  '0xEA071fa5a8aD4dEa8c672569da366D7d90E5924d', // KAL/WETH
]

// Aerodrome KAL/USDC pool is counted by Aerodrome; only the LP staked in KalAeroLPStaking is pool2
const AERO_KAL_USDC = '0x65e8d79D0103A470e92A81F2cDB970bA9a823b9E'
const AERO_LP_STAKING = '0x8E5176e0B020C3a8D33425E2B5b62e12EB39f11d'

// Single-side KAL staking and veKAL
const STAKING = [
  '0xF392A8F1B6c85f607F988B44EcAE2B4d652585f5',
  '0x590f7d2ba77ADac6fC1e3cc2df16781989919529',
  '0x58CfcB5A67Aac6255cA13771EbdCFF45bAd5d605',
  '0x116BBb2333B482cAB15ae10620E7671D6231434e', // LiquidityRewards V8_2
]

async function tvl(api) {
  // Each vault holds depositors' USDC plus the platform reserve (reserveBalance).
  // Part of the reserve can be out with the trading operator (operatorBalance),
  // so the reserve still sitting in the vault is reserveBalance - operatorBalance.
  // That part is protocol-owned and is reported in the Kal Mydas treasury adapter.
  const balances = await api.multiCall({ abi: 'erc20:balanceOf', target: USDC, calls: VAULTS })
  // vaults not yet deployed at this block hold no USDC and revert on the getters, so skip empty ones
  const funded = VAULTS.map((vault, i) => ({ vault, held: BigInt(balances[i]) })).filter(v => v.held > 0n)
  const calls = funded.map(v => v.vault)
  const [reserves, operatorBalances] = await Promise.all([
    api.multiCall({ abi: 'uint256:reserveBalance', calls }),
    api.multiCall({ abi: 'uint256:operatorBalance', calls }),
  ])
  funded.forEach(({ held }, i) => {
    const reserveInVault = BigInt(reserves[i]) - BigInt(operatorBalances[i])
    const userUSDC = held - (reserveInVault > 0n ? reserveInVault : 0n)
    if (userUSDC > 0n) api.add(USDC, userUSDC.toString())
  })
  return api.sumTokens({ owner: USDC_WETH_PAIR, tokens: [USDC, WETH] })
}

async function pool2(api) {
  await api.sumTokens({ owners: KAL_PAIRS, tokens: [USDC, WETH, KAL] })
  // the Aerodrome LP token reverts before the pool was deployed, when it held no USDC
  const aeroUSDC = await api.call({ abi: 'erc20:balanceOf', target: USDC, params: AERO_KAL_USDC })
  if (BigInt(aeroUSDC) === 0n) return api.getBalances()
  return sumTokens2({ api, owner: AERO_LP_STAKING, tokens: [AERO_KAL_USDC], resolveLP: true })
}

module.exports = {
  methodology: 'TVL is the USDC deposited by users in the KalPool strategy vaults (vault USDC balance minus the platform reserve still held in the vault, reserveBalance - operatorBalance) plus the USDC and WETH in the KalSwap USDC/WETH market, on Base. All live vault generations (V5_1_4, V5_2_0 and V5_2_2) are counted during the migration. The platform reserve is protocol-owned trading capital and is reported in the Kal Mydas treasury. KalSwap markets paired with KAL and the Aerodrome KAL/USDC LP staked in the Kal Mydas Aerodrome LP staking are farmed for KAL rewards and reported under pool2. KAL staked single-side and KAL locked in veKAL are reported under staking.',
  base: {
    tvl,
    pool2,
    staking: (api) => api.sumTokens({ owners: STAKING, tokens: [KAL] }),
  },
}
