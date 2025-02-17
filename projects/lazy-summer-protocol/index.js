const config = {
  ethereum: '0x09eb323dBFECB43fd746c607A9321dACdfB0140F',
  base: '0x09eb323dBFECB43fd746c607A9321dACdfB0140F',
  arbitrum: '0x09eb323dBFECB43fd746c607A9321dACdfB0140F',
}

Object.keys(config).forEach(chain => {
  const factory = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const vaults = await api.call({  abi: 'address[]:getActiveFleetCommanders', target: factory })
      const assets = await api.multiCall({  abi: 'address:asset', calls: vaults })
      const balances = await api.multiCall({  abi: 'uint256:totalAssets', calls: vaults })
      api.add(assets, balances)
    }
  }
})