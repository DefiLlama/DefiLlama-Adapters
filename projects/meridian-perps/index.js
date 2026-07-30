const ADDRESSES = require('../helper/coreAssets.json')

const LP_VAULT = '0x24b84023c8e4Da635be228C380C09bfE5271BF9d'

module.exports = {
  methodology: 'TVL is the USDe value of the Meridian LP vault. The vault NAV is held in the strategy, so value is computed as convertToAssets(totalSupply) rather than totalAssets.',
  robinhood: {
    tvl: async (api) => {
      const totalSupply = await api.call({ abi: 'uint256:totalSupply', target: LP_VAULT })
      const assets = await api.call({ abi: 'function convertToAssets(uint256 shares) view returns (uint256)', target: LP_VAULT, params: totalSupply })
      api.add(ADDRESSES.robinhood.USDe, assets)
    },
  },
}
