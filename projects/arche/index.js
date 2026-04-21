const ADDRESSES = require('../helper/coreAssets.json')

const ARUSD_VAULT = '0x33FfC177A7278FF84aaB314A036bC7b799B7Cc15'

module.exports = {
  methodology: 'Counts USDC held by the arUSD ERC-4626 vault, retrieved via totalAssets(). The vault deploys USDC into Yearn V3 strategies; doublecounted is set to true to avoid ecosystem-level double counting with Yearn.',
  doublecounted: true,
  ethereum: {
    tvl: async (api) => {
      const totalAssets = await api.call({ abi: 'uint256:totalAssets', target: ARUSD_VAULT })
      api.add(ADDRESSES.ethereum.USDC, totalAssets)
    }
  }
}
