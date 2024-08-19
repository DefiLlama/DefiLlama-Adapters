
const ADDRESSES = require('../helper/coreAssets.json')

const YN_ETH = '0x09db87a538bd693e9d08544577d5ccfaa6373a48'
const YN_LSDE = '0x35Ec69A77B79c255e5d47D5A3BdbEFEfE342630c'

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const ynethBalance = await api.call({  abi: 'uint256:totalAssets', target: YN_ETH })
      api.add(ADDRESSES.null, ynethBalance)

      const ynlsdeBalance = await api.call({  abi: 'uint256:totalAssets', target: YN_LSDE })
      api.add(ADDRESSES.null, ynlsdeBalance)

      return api.getBalances()
    }
  },
}