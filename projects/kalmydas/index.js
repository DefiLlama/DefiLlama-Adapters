const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')

const KAL = '0xe99556D5594faf533fcB346A8a9B11259D29afA8'

const PAIRS = [
    '0x3315E6E788E2B30aF8f4c35124695E60D510c31B', // KalSwap V2 KAL/USDC
    '0xEA071fa5a8aD4dEa8c672569da366D7d90E5924d', // KalSwap KAL/WETH
    '0x83c26f5C90B81adDf50845CCFCdcd02B819ADeB5', // KalSwap USDC/WETH
]

const POOLS = [
    '0x96869F08F5B5C52664c9620269394eFF4efd065b', // HORIZON
    '0x6dd6e7A6154293b22Dcd5d07d8f61F446646B15d', // VALKYRIE
    '0x9A9990fdFf702f7aEd10f873eeD2baB60e493038', // REVOLUTION
    '0x03FEC25393C38cC5DE1F2D2DB620b8478cAC4Ae0', // TREASURY
    '0x55F8D85749EA9C374b3aBFaEF7B07429546F6A97', // ORION
]

const STAKING_CONTRACTS = [
    '0xF392A8F1B6c85f607F988B44EcAE2B4d652585f5', // LiquidityRewards V6_3 (stakeKAL)
    '0x58CfcB5A67Aac6255cA13771EbdCFF45bAd5d605', // veKAL locker
]

module.exports = {
    methodology: 'TVL is the sum of tokens (USDC, WETH, KAL) held by the KalSwap liquidity pairs plus the USDC held by the five KalPool strategy vaults (deposits and platform reserve) on Base mainnet. USDC temporarily allocated to the on-chain operator (max 20% of each vault reserve) leaves the vaults while a trade is open and returns on close. KAL staked single-side and KAL locked in veKAL are reported under staking.',
    base: {
        tvl: (api) => api.sumTokens({owners: [...PAIRS, ...POOLS], tokens: [ADDRESSES.base.USDC, ADDRESSES.base.WETH, KAL]}),
        staking: staking(STAKING_CONTRACTS, KAL),
    }
}
