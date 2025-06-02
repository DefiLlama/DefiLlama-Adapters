const { unknownTombs } = require("../helper/unknownTokens");

const emp = "0x0DDCE00654f968DeD59A444da809F2B234047aB1";
const firm = "0x368F6d735F3Fc8Aa0568D2B7aB275cB828B79709";
const horizon = "0x71d2009460383c970c08b0e37cc8f029bce5bbcd";
const rewardPool = "0x15084E92785027D4D4918CAbfa11281fC15bF9AC";
const lps = [
    "0x87e65159edafae4bb1ccd0c94c7ec9427409b370", // FIRM-USDC LP
    "0x06675843400F2267060ee886C9088fF498f7c8eC", // EMP-egARB
    "0x400ebc22c31bedcdab38a6b27963912df71840ed",
]

module.exports = unknownTombs({
    token: emp,
    shares: [firm],
    masonry: [horizon],
    rewardPool: [rewardPool],
    chain: 'arbitrum',
    lps,
    useDefaultCoreAssets: true,
})
