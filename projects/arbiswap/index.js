const { getUniTVL, sumTokensExport } = require('../helper/unknownTokens')
const ARBI = "0x224800804f217d98defa2aac245f25f82df6f7f7";


const dexTVL = getUniTVL({ factory: '0x88F1E030eb4C6C4320Da3992070bAF6c648ce37f', fetchBalances: true, useDefaultCoreAssets: true })


module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses factory(0x88F1E030eb4C6C4320Da3992070bAF6c648ce37f) address and whitelisted tokens address to find and price Liquidity Pool pairs. We also have our native token $ARBI staking.`,
    arbitrum: {
        tvl: dexTVL,
        staking: sumTokensExport({
            owners: ['0x21e185462FEafCd807330B11A46D1F934D5392B4'],
            tokens: [ARBI],
        })
    }
};