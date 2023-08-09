const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

module.exports = {
  hallmarks: [[1667955600, "Hack"]],
};

const config = {
  arbitrum: { factory: "0x9544995B5312B26acDf09e66E699c34310b7c856", fromBlock: 65832059 },
  ethereum: { factory: "0x9adeac3b6d29d9d5e543b8579e803a7cce72c9cd", fromBlock: 16607851 },
  polygon: { factory: "0x3591040cE5dF8828b3Ed4Ec39D030F832d43fD53", fromBlock: 39183403 },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0xe7a19de9e8788cc07c144818f2945144acd6234f790b541aa1010371c8b2a73b'],
        eventAbi: 'event NewCurve (address indexed caller, bytes32 indexed id, address indexed curve)',
        onlyArgs: true,
        fromBlock,
      })
      let pools = logs.map(log => log.curve)
      if (chain === 'arbitrum') pools = pools.slice(1)
      const calls = pools.map(pool => [{ target: pool, params: 0 }, { target: pool, params: 1 }]).flat()
      const tokens = await api.multiCall({ abi: 'function numeraires(uint256) view returns (address)', calls })
      const tokensAndOwners = tokens.map((token, i) => [token, pools[Math.floor(i / 2)]])
      return sumTokens2({ api, tokensAndOwners, })
    }
  }
})