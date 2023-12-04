const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  arbitrum_nova: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0xf6239423FcF1c19ED2791D9648A90836074242Fd',
    })
  },
  arbitrum: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0xd394e9cc20f43d2651293756f8d320668e850f1b',
    })
  }
};
