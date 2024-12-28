const { getFactoryTvl } = require('../terraswap/factoryTvl')

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    methodology: "Liquidity on the DEX",
    aura: {
        tvl: getFactoryTvl("aura18qwll06qjgkfl5s5ym4rtpz8jy2tl849ghgx402tm4w9v55wu5asn0mqhv",)
    },
} // node test.js projects/hallotrade/index.js