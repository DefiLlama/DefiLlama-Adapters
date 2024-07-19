const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')


const config = {
  arbitrum: [{ factory: "0xDe9c71503648C03F529305e03D259f2eBa9c8fDe", fromBlock: 148999765 }],
  ethereum: [{ factory: "0xCe2b8E0c196b7F9297A9c168Dfe1A97768297835", fromBlock: 18566782 }],
  polygon: [{ factory: "0xe5ce84bba5b27ccfb7d92cb3e1426d8a986854dd", fromBlock: 49699467 }],
}

Object.keys(config).forEach(chain => {
  const configs = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = []
      for (const { factory, fromBlock } of configs) {
        logs.push(await getLogs({
          api,
          target: factory,
          topics: ['0xe7a19de9e8788cc07c144818f2945144acd6234f790b541aa1010371c8b2a73b'],
          eventAbi: 'event NewCurve (address indexed caller, bytes32 indexed id, address indexed curve)',
          onlyArgs: true,
          fromBlock,
        }))
      }
      let pools = logs.flat().map(log => log.curve)
      if (chain === 'arbitrum') pools = pools.slice(1)
      const calls = pools.map(pool => [{ target: pool, params: 0 }, { target: pool, params: 1 }]).flat()
      const tokens = await api.multiCall({ abi: 'function numeraires(uint256) view returns (address)', calls })
      const tokensAndOwners = tokens.map((token, i) => [token, pools[Math.floor(i / 2)]])
      return sumTokens2({ api, tokensAndOwners, })
    }
  }
})