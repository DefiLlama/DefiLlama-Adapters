const ADDRESSES = require('../helper/coreAssets.json')

//ETH Assets
const eY10K = '0x953972ea0C1703c58F09FB6fD2477Fdcf0FEe074'

//SEI Assets
const y10kPYUSD = '0x6137dcfdd3c83fe2922b1cba4105d2e92b327a06'

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: async (api) => {
      return api.erc4626Sum({ calls: [eY10K], isOG4626: true})
    }
  },
  sei: {
    tvl: async (api) => {
      return api.erc4626Sum({ calls: [y10kPYUSD], isOG4626: true})
    }
  },
}