const ADDRESSES = require('../helper/coreAssets.json')

const VAULTS = {
  USDC: '0x03067bbD0d41E3Fe4A0bb6ca67c99e7352Da4CAE',
  USDT: '0x25d90ABd6c1E8DCCD40932D2fdD2Cd381bfc832D',
}

module.exports = {
  base: {
    tvl: async (api) => {
      for (const [symbol, vault] of Object.entries(VAULTS)) {
        const totalAssets = await api.call({ target: vault, abi: 'uint256:totalAssets' })
        api.add(ADDRESSES.base[symbol], totalAssets)
      }
    }
  },
  doublecounted: true,
}
