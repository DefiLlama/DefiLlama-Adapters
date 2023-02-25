const { getUniTVL, sumTokensExport } = require('../helper/unknownTokens')
const ARBI = "0x9dB8a10C7FE60d84397860b3aF2E686D4F90C2b7";


const dexTVL = getUniTVL({ factory: '0x88F1E030eb4C6C4320Da3992070bAF6c648ce37f', fetchBalances: true, useDefaultCoreAssets: true })


module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses factory(0x88F1E030eb4C6C4320Da3992070bAF6c648ce37f) address and whitelisted tokens address to find and price Liquidity Pool pairs. We also have our native token $ARBI staking.`,
    arbitrum: {
        tvl: dexTVL,
        staking: sumTokensExport({
            owner: '0x21e185462FEafCd807330B11A46D1F934D5392B4',
            tokens: [ARBI],
            lps: ['0x224800804F217d98dEFA2AAC245F25F82df6f7F7'],
            useDefaultCoreAssets: true,
        })
    }
};