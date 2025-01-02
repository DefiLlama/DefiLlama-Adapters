const config = {
  ethereum: ['0x530824DA86689C9C17CdC2871Ff29B058345b44a', '0x2103E845C5E135493Bb6c2A4f0B8651956eA8682'],
  bsc: ['0x23AE4fd8E7844cdBc97775496eBd0E8248656028']
}

Object.keys(config).forEach(chain => {
  const tokens = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const supplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: tokens })
      api.add(tokens, supplies)
    }
  }
})