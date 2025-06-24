const { getUniTVL, } = require('../helper/unknownTokens')

const dexTVL = getUniTVL({ factory: '0x88F1E030eb4C6C4320Da3992070bAF6c648ce37f',  useDefaultCoreAssets: true })

module.exports = {
    //   hallmarks: [
    //  [1677744000,"Rug Pull"]
    //  ],
    misrepresentedTokens: true,
    methodology: `Uses factory(0x88F1E030eb4C6C4320Da3992070bAF6c648ce37f) address and whitelisted tokens address to find and price Liquidity Pool pairs. We also have our native token $ARBI staking.`,
    arbitrum: {
        tvl: dexTVL,
    }
};
