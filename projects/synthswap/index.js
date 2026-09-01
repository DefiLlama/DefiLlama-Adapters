const { getUniTVL, sumTokensExport } = require('../helper/unknownTokens')
const SYNTH = "0xbd2DBb8eceA9743CA5B16423b4eAa26bDcfE5eD2";
const FACTORY = "0x4bd16d59A5E1E0DB903F724aa9d721a31d7D720D"


const dexTVL = getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true })


module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses factory(${FACTORY}) address and whitelisted tokens address to find and price Liquidity Pool pairs.`,
    base: {
        tvl: dexTVL,
        staking: sumTokensExport({
            owners: ['0x01CC6b33c63CeE896521D63451896C14D42D05Ea'],
            tokens: [SYNTH],
        })
    }
};


