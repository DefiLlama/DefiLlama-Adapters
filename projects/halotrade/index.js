const { getFactoryTvl } = require('../terraswap/factoryTvl')
const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    methodology: "Liquidity on the DEX",
    aura: {
        tvl: getFactoryTvl("aura18qwll06qjgkfl5s5ym4rtpz8jy2tl849ghgx402tm4w9v55wu5asn0mqhv")
    },
    evm: {
        tvl: getUniTVL({ factory: '0xa51DDB350e768052B7e44e1087D08fe2DD32b1df', useDefaultCoreAssets: true }),
    },
} // node test.js projects/hallotrade/index.js
