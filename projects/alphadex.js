const { getUniTVL } = require('./helper/unknownTokens')
module.exports = {
    methodology: `Uses factory(0xdD9EFCbDf9f422e2fc159eFe77aDD3730d48056d) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
    misrepresentedTokens: true,
    moonriver: {
        tvl: getUniTVL({
            factory: "0xdD9EFCbDf9f422e2fc159eFe77aDD3730d48056d",
            chain: 'moonriver',
            useDefaultCoreAssets: true,
        })
    }
};