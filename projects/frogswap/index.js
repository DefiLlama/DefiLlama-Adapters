const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  degen: { tvl: getUniTVL({ factory: '0xA994635243b55468B9C421559516BdE229E0930B', useDefaultCoreAssets: true, fetchBalances: true, }), },
}