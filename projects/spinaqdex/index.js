const { getUniTVL } = require('../helper/unknownTokens');

const SPINAQ = "0x802124EB78E43FD8d3d4E6DAAAa4Be28Dc7993dc";
const FACTORY = "0x36E0F99A19481976C42CC45Aec7205B10807E275"


module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses Uniswap-style factory address to find and price liquidity pairs.`,
    arbitrum: {
        tvl: getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true,}),
    },
};