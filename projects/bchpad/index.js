const sdk = require('@defillama/sdk');
const { calculateUsdUniTvlPairs } = require('../helper/getUsdUniTvl')
const { staking } = require('../helper/staking')

const CHAIN = "smartbch"

// token contracts
const WBCH = "0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04"
const LAW = "0x0b00366fBF7037E9d75E4A569ab27dAB84759302"
const MIST = "0x5fA664f69c2A4A3ec94FaC3cBf7049BD9CA73129"
const BPAD = "0x9192940099fDB2338B928DE2cad9Cd1525fEa881"
const CATS = "0x265bD28d79400D55a1665707Fa14A72978FA6043"

// tvl pools
const BPAD_POOL = "0xc39f046a0E2d081e2D01558269D1e3720D2D2EA1" // BPAD single asset pool, ended
const CATS_POOL = "0x9F8a513C11c278dfF624678108B41310fA0398E3" // CATS single asset pool, ended
const MIST_POOL = "0x919D17195Aa7E4733FE1bd7245E97931FD62D21d" // MIST signle asset pool, ended
const LAW_POOL = "0xA3Ac25321789626e30b49d7F34ef0e326D19f582"  // LAW single asset pool

const bpadPoolTVL = staking(BPAD_POOL, BPAD, CHAIN, "bchpad", 18)
const catsPoolTVL = staking(CATS_POOL, CATS, CHAIN, "cashcats", 2)
const mistPoolTVL = staking(MIST_POOL, MIST, CHAIN, "mistswap", 18)
const lawPoolTVL = staking(LAW_POOL, LAW, CHAIN, "law", 18)

// tvl pairs
const BPAD_WBCH_PAIR = "0x8221d04a71fcd0dd3d096cb3b49e22918095933f"
const bpadWbchPairTVL = calculateUsdUniTvlPairs([BPAD_WBCH_PAIR], CHAIN, WBCH, [BPAD], "bitcoin-cash", 18)

const totalTVLs = sdk.util.sumChainTvls([lawPoolTVL, bpadWbchPairTVL])
const totalStaking = sdk.util.sumChainTvls([bpadPoolTVL, catsPoolTVL, mistPoolTVL])

module.exports = {
    misrepresentedTokens: true,
    methodology: "BCHPad uses LP pools created on other dexes and single asset pools of non-native tokens for their liquidity mining, these pools are used for TVL calculation.",
    smartbch: {
        tvl: totalTVLs,
        staking: totalStaking
    },
}
