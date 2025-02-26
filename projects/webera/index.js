const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')

async function tvl(api) {
  // Get total assets deposited in bera vault
  const totalBERAAssets = await api.call({ target: "0x55a050f76541C2554e9dfA3A0b4e665914bF92EA", abi: 'uint256:totalAssets', })

  // Get total assets deposited in honey vault
  const totalHONEYAssets = await api.call({ target: "0x4eAD3867554E597C7B0d511dC68ceaD59286870D", abi: 'uint256:totalAssets', })

  // Add BERA balance to TVL
  // Using null address for native token (BERA)
  api.add(ADDRESSES.null, totalBERAAssets)
  api.add(ADDRESSES.berachain.HONEY, totalHONEYAssets)
}

module.exports = {
  berachain: {
    tvl
  },
  start: '2025-02-18',  // 18/02/2025 @ 00:00am (UTC)
}