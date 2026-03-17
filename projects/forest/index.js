const { sumTokensExport } = require('../helper/unwrapLPs')

const FOREST_TOKEN = '0x11cf6bf6d87cb0eb9c294fd6cbfec91ee3a1a7d0'
const STAKING_CONTRACT = '0xb6C6B8bF9d415E2D91B95134800De146Dcc5dc94'

const EXTERNAL_FOREST_POOLS = []

const COIN_FACTORIES = [
  '0x9d5ef0f61a5e88d90fb231f84413b5fc43bf6a9e', // V1 LP factory
  '0x8ad812a372b4c5aa1fc478b720f2adad42002f81', // V2 LP factory
]

const abi = {
  allPairsLength: 'function allPairsLength() view returns (uint256 )',
  allPairs: 'function allPairs(uint256) view returns (address)',
}

async function forestCoinPools(api) {
  const pairs = []
  for (const factory of COIN_FACTORIES) {
    const pairsLength = Number(await api.call({ abi: abi.allPairsLength, target: factory }))
    if (!pairsLength) continue
    const factoryPairs = await api.multiCall({
      abi: abi.allPairs,
      target: factory,
      calls: Array.from({ length: pairsLength }, (_, i) => i),
    })
    pairs.push(...factoryPairs)
  }

  return [...new Set(pairs)]
}

module.exports = {
  bsc: {
    tvl: () => 0,
    staking: sumTokensExport({ owner: STAKING_CONTRACT, tokens: [FOREST_TOKEN] }),
    pool2: async (api) => {
      const factoryPairs = await forestCoinPools(api)
      const owners = [...new Set([...EXTERNAL_FOREST_POOLS, ...factoryPairs])]
      return api.sumTokens({ owners, tokens: [FOREST_TOKEN] })
    },
  }
}