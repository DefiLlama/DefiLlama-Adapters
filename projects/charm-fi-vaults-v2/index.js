const config = {
  ethereum: {},
  arbitrum: {},
  optimism: {},
  polygon: {},
  base: {},
  boba: { factory: '0xFaf1Af4dC761dBA157227a3c06CeC9A7486D8a07' },
  blast: { factory: '0x8C554F200B1EEECdE99370Fe6284B15d23E50E07' },
  scroll: { factory: '0xc2cC57a62982c4C92C69B856B5d03c6DECa32E77' },
  linea: { factory: '0x8C554F200B1EEECdE99370Fe6284B15d23E50E07' },
  katana: { factory: '0xF0F42C62923c6e741C64E0163C5C50965C05dF61' },
  berachain: { factory: '0x189bD734C2f1beeaca81e0edbB1cE3B8A16ed137' },
}

const tvl = async (api) => {
  const { factory = '0x5B7B8b487D05F77977b7ABEec5F922925B9b2aFa' } = config[api.chain]
  const vaults = await api.fetchList({ lengthAbi: 'uint256:numVaults', itemAbi: 'function vaults(uint) view returns (address)', target: factory })

  const token0s = await api.multiCall({ abi: 'address:token0', calls: vaults, permitFailure: true })
  const token1s = await api.multiCall({ abi: 'address:token1', calls: vaults, permitFailure: true })
  const bals = await api.multiCall({ abi: 'function getTotalAmounts() view returns (uint256 bal0, uint256 bal1)', calls: vaults, permitFailure: true })

  bals.forEach((bal, i) => {
    if (!bal || !token0s[i] || !token1s[i]) return
    api.add(token0s[i], bal.bal0)
    api.add(token1s[i], bal.bal1)
  })
}

module.exports = {
  doublecounted: true,
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl }
})
