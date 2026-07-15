const ADDRESSES = require('../helper/coreAssets.json')

const eY10K = '0x953972ea0C1703c58F09FB6fD2477Fdcf0FEe074'

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: async (api) => {
      return api.erc4626Sum({ calls: [eY10K], isOG4626: true})
    }
  },
}