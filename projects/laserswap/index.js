const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  methodology: `Uses factory(0x23c7FA9A9f81B322684F25b8079e22C37e00b46b) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
  thundercore: {
    tvl: getUniTVL({ factory: '0x23c7FA9A9f81B322684F25b8079e22C37e00b46b', useDefaultCoreAssets: true }),
  },
}
