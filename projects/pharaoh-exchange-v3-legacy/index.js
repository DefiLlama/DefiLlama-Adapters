const {getUniTVL} = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

module.exports = {
  misrepresentedTokens: true,
  avax:{
    tvl: getUniTVL({ factory: '0x85448bF2F589ab1F56225DF5167c63f57758f8c1', useDefaultCoreAssets: true,  hasStablePools: true, stablePoolSymbol: 'Stable' })
  },
}