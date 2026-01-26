

const { getUniTVL } = require('../helper/unknownTokens')



module.exports = {
    misrepresentedTokens: true,
    scroll: {
      tvl: getUniTVL({
        factory: '0xC7e06CAF7880421cD21E98656B4755B3Df61537b',
        useDefaultCoreAssets: true,
        hasStablePools: true,
        fetchBalances: true, // get reserves call fails
      })
    }
  }