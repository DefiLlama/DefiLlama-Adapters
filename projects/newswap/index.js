const { getUniTVL } = require("../helper/cache/uniswap")

module.exports = {
  misrepresentedTokens: true,
  new: { tvl: getUniTVL({ factory: '0x723913136a42684B5e3657e3cD2f67ee3e83A82D', useDefaultCoreAssets: true }) }
}