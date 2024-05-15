
const ADDRESSES = require('../helper/coreAssets.json')

const token = '0x09db87a538bd693e9d08544577d5ccfaa6373a48'

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const ethBalance = await api.call({  abi: 'uint256:totalAssets', target: token })
      api.add(ADDRESSES.null, ethBalance)
      return api.getBalances()
    }
  },
}