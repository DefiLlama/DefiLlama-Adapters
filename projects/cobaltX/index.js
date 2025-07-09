const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  soon: {
    tvl: async () => {
      return {
        [`soon:${ADDRESSES.soon.USDT}`]: 1000000
      }
    },
  },

}