const { sliceIntoChunks } = require('../helper/utils')

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
  katana: {factory: '0xF0F42C62923c6e741C64E0163C5C50965C05dF61'},
  berachain: {factory: '0x189bD734C2f1beeaca81e0edbB1cE3B8A16ed137'},
}

async function multiCallBatched(api, params, batchSize = 100, delayMs = 0) {
  const { calls, ...rest } = params
  if (!Array.isArray(calls) || calls.length === 0) return []
  if (!batchSize || batchSize < 1 || calls.length <= batchSize)
    return api.multiCall({ ...rest, calls })

  const chunks = sliceIntoChunks(calls, batchSize)
  const results = []
  for (const chunk of chunks) {
    const res = await api.multiCall({ ...rest, calls: chunk })
    results.push(...res)
    if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs))
  }
  return results
}

const tvl = async (api) => {
  const chain = api.chain
  const isKatana = chain === 'katana'
  const { factory = '0x5B7B8b487D05F77977b7ABEec5F922925B9b2aFa' } = config[chain]
  const vaults = await api.fetchList({ lengthAbi: 'uint256:numVaults', itemAbi: 'function vaults(uint) view returns (address)', target: factory })
  const opts = isKatana ? { batchSize: 10, delayMs: 0 } : { batchSize: vaults.length }

  const [token0s, token1s, bals] = await Promise.all([
    multiCallBatched(api, { abi: 'address:token0', calls: vaults }, opts.batchSize, opts.delayMs),
    multiCallBatched(api, { abi: 'address:token1', calls: vaults }, opts.batchSize, opts.delayMs),
    multiCallBatched(api, { abi: 'function getTotalAmounts() view returns (uint256 bal0, uint256 bal1)', calls: vaults }, opts.batchSize, opts.delayMs),
  ])

  bals.forEach(({ bal0, bal1 }, i) => {
    api.add(token0s[i], bal0),
    api.add(token1s[i], bal1)
  })
}

module.exports = {
  doublecounted: true,
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl }
})
