const { getUniTVL } = require('../helper/unknownTokens')


module.exports = {
  bsc: {
    tvl: async (api) => {
      if (!process.env.PCS_PULL)
        throw new Error("PCS_PULL environment variable not set. Please set it to 'true' to enable TVL calculation.")
      const tvlFunction = getUniTVL({ factory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73', useDefaultCoreAssets: true, skipUnknownTokens: true, waitBetweenCalls: 4000, queryBatched: 25000, })
      return tvlFunction(api)
    }
  },
}