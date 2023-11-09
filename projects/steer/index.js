const { cachedGraphQuery } = require('../helper/cache')
const { staking } = require("../helper/staking");

const supportedChains = [
  {
    name: 'Polygon',
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/steerprotocol/steer-protocol-polygon',
    chainId: 137,
    merkl: true,
    identifier: 'polygon'
  },
  {
    name: 'Arbitrum',
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/steerprotocol/steer-protocol-arbitrum',
    chainId: 42161,
    merkl: true,
    identifier: 'arbitrum'
  },
  {
    name: 'Optimism',
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/steerprotocol/steer-protocol-optimism',
    chainId: 10,
    merkl: true,
    identifier: 'optimism'
  },
  {
    name: 'Binance',
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/steerprotocol/steer-protocol-bsc',
    chainId: 56,
    merkl: false,
    identifier: 'bsc'
  },
  {
    name: 'Evmos',
    subgraphEndpoint: 'https://subgraph.satsuma-prod.com/769a117cc018/steer/steer-protocol-evmos/api',
    chainId: 9001,
    merkl: false,
    identifier: 'evmos'
  },
  {
    name: 'Avalanche',
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/rakeshbhatt10/avalance-test-subgraph',
    chainId: 43114,
    merkl: false,
    identifier: 'avax'
  },
  {
    name: 'Thundercore',
    subgraphEndpoint: 'http://52.77.49.1:8000/subgraphs/name/steerprotocol/steer-thundercore',
    chainId: 108,
    merkl: false,
    identifier: 'thundercore'
  },
  {
    name: 'Kava',
    subgraphEndpoint: 'https://subgraph.steer.finance/kava/subgraphs/name/steerprotocol/steer-kava-evm',
    chainId: 2222,
    merkle: false,
    identifier: 'kava'
  },
  {
    name: 'Base',
    subgraphEndpoint: 'https://subgraph.satsuma-prod.com/769a117cc018/steer/steer-protocol-base/api',
    chainId: 8453,
    merkle: false,
    identifier: 'base'
  },
  // {
  //   name: 'Linea',
  //   subgraphEndpoint: 'https://subgraph.steer.finance/linea/subgraphs/name/steerprotocol/steer-linea/graphql',
  //   chainId: 59144,
  //   merkle: false,
  //   identifier: 'linea'
  // },
  {
    name: 'Metis',
    subgraphEndpoint: 'https://subgraph.satsuma-prod.com/769a117cc018/steer/steer-protocol-metis/api',
    chainId: 1088,
    merkle: false,
    identifier: 'metis'
  },
  // {
  //   name: 'Manta',
  //   subgraphEndpoint: 'https://subgraph.steer.finance/manta/subgraphs/name/steerprotocol/steer-manta/graphql',
  //   chainId: 169,
  //   merkle: false,
  //   identifier: 'manta'
  // },
  // {
  //   name: 'PolygonZKEVM',
  //   subgraphEndpoint: 'https://subgraph.steer.finance/zkevm/subgraphs/name/steerprotocol/steer-zkevm',
  //   chainId: 1101,
  //   merkle: false,
  //   identifier: 'polyzkevm'
  // },
  // {
  //   name: 'Scroll',
  //   subgraphEndpoint: 'https://subgraph.steer.finance/scroll/subgraphs/name/steerprotocol/steer-scroll/graphql',
  //   chainId: 534352,
  //   merkle: false,
  //   identifier: 'scroll'
  // },
  // {
  //   name: 'Celo',
  //   subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/rakeshbhatt10/steer-test-celo',
  //   chainId: 42220,
  //   merkle: false,
  //   identifier: 'celo'
  // },
]


// Fetch active vaults and associated data @todo limited to 1000 per chain
const query = `
{
    vaults(first: 1000, where: {totalLPTokensIssued_not: "0", lastSnapshot_not: "0"}) {
      id
    }
  }`

supportedChains.forEach(chain => {
  module.exports[chain.identifier] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const data = await cachedGraphQuery('steer/' + chain.identifier, chain.subgraphEndpoint, query,)

      const vaults = data.vaults.map((vault) => vault.id)
      const bals = await api.multiCall({ abi: "function getTotalAmounts() view returns (uint256 total0, uint256 total1)", calls: vaults, permitFailure: true, })
      const token0s = await api.multiCall({ abi: "address:token0", calls: vaults, permitFailure: true, })
      const token1s = await api.multiCall({ abi: "address:token1", calls: vaults, permitFailure: true, })
      bals.forEach((bal, i) => {
        const token0 = token0s[i]
        const token1 = token1s[i]
        if (!bal || !token0 || !token1) return // skip failures
        api.add(token0, bal.total0)
        api.add(token1, bal.total1)
      })
      return api.getBalances()
    }
  }
})

module.exports.arbitrum.staking = staking("0xB10aB1a1C0E3E9697928F05dA842a292310b37f1", "0x1C43D05be7E5b54D506e3DdB6f0305e8A66CD04e", "arbitrum")