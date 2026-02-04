const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// module.exports = {
//   hallmarks: [[1667955600, "Hack"]],
// };

const config = {
  ethereum: [{ factory: "0x2e9E34b5Af24b66F12721113C1C8FFcbB7Bc8051", fromBlock: 19773852 }],
  polygon: [{ factory: "0x3c60234db40e6e5b57504e401b1cdc79d91faf89", fromBlock: 56377840 }],
  base: [{ factory: "0x86Ba17ebf8819f7fd32Cf1A43AbCaAe541A5BEbf", fromBlock: 32584321 }],
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