const sdk = require("@defillama/sdk");
const { cachedGraphQuery } = require('../helper/cache')
const { stakings } = require("../helper/staking");


const supportedChains = [
  {
    name: 'Polygon',
    subgraphEndpoint: sdk.graph.modifyEndpoint('uQxLz6EarmJcr2ymRRmTnrRPi8cCqas4XcPQb71HBvw'),
    chainId: 137,
    identifier: 'polygon'
  },
  {
    name: 'Arbitrum',
    subgraphEndpoint: sdk.graph.modifyEndpoint('HVC4Br5yprs3iK6wF8YVJXy4QZWBNXTCFp8LPe3UpcD4'),
    chainId: 42161,
    identifier: 'arbitrum'
  },
  {
    name: 'Optimism',
    subgraphEndpoint: sdk.graph.modifyEndpoint('GgW1EwNARL3dyo3acQ3VhraQQ66MHT7QnYuGcQc5geDG'),
    chainId: 10,
    identifier: 'optimism'
  },
  {
    name: 'Binance',
    subgraphEndpoint: sdk.graph.modifyEndpoint('GLDP56fPGDz3MtmhtfTkz5CxWiqiNLACVrsJ9RqQeL4U'),
    chainId: 56,
    identifier: 'bsc'
  },
  {
    name: 'Evmos',
    subgraphEndpoint: 'https://subgraph.satsuma-prod.com/769a117cc018/steer/steer-protocol-evmos/api',
    chainId: 9001,
    identifier: 'evmos'
  },
  {
    name: 'Avalanche',
    subgraphEndpoint: sdk.graph.modifyEndpoint('GZotTj3rQJ8ZqVyodtK8TcnKcUxMgeF7mCJHGPYbu8dA'),
    chainId: 43114,
    identifier: 'avax'
  },
  {
    name: 'Thundercore',
    subgraphEndpoint: 'https://api.goldsky.com/api/public/project_clohj3ta78ok12nzs5m8yag0b/subgraphs/steer-protocol-thundercore/1.0.0/gn',
    chainId: 108,
    identifier: 'thundercore'
  },
  {
    name: 'Kava',
    subgraphEndpoint: 'https://subgraph.steer.finance/kava/subgraphs/name/steerprotocol/steer-kava-evm',
    chainId: 2222,
    identifier: 'kava'
  },
  {
    name: 'Base',
    subgraphEndpoint: 'https://subgraph.satsuma-prod.com/769a117cc018/steer/steer-protocol-base/api',
    chainId: 8453,
    identifier: 'base'
  },
  {
    name: 'Linea',
    subgraphEndpoint: 'https://subgraph.steer.finance/linea/subgraphs/name/steerprotocol/steer-linea',
    chainId: 59144,
    identifier: 'linea'
  },
  {
    name: 'Metis',
    subgraphEndpoint: 'https://subgraph.satsuma-prod.com/769a117cc018/steer/steer-protocol-metis/api',
    chainId: 1088,
    identifier: 'metis'
  },
  {
    name: 'Manta',
    subgraphEndpoint: 'https://subgraph.steer.finance/manta/subgraphs/name/steerprotocol/steer-manta',
    chainId: 169,
    identifier: 'manta'
  },
  {
    name: 'PolygonZKEVM',
    subgraphEndpoint: 'https://subgraph.steer.finance/zkevm/subgraphs/name/steerprotocol/steer-zkevm',
    chainId: 1101,
    identifier: 'polygon_zkevm'
  },
  {
    name: 'Scroll',
    subgraphEndpoint: 'https://subgraph.steer.finance/scroll/subgraphs/name/steerprotocol/steer-scroll',
    chainId: 534352,
    identifier: 'scroll'
  },
  {
    name: 'Mantle',
    subgraphEndpoint: 'https://subgraph-api.mantle.xyz/subgraphs/name/steerprotocol/steer-protocol-mantle',
    chainId: 5000,
    identifier: 'mantle'
  },
  {
    name: 'Astar',
    subgraphEndpoint: 'https://subgraph.steer.finance/astar/subgraphs/name/steerprotocol/steer-astar',
    chainId: 4369,
    identifier: 'astar'
  },
  {
    name: 'Fantom',
    subgraphEndpoint: sdk.graph.modifyEndpoint('8k6x2Uho5PEqjxHx5SeSE334MEaxSZqMZhH6p5XYvqjM'),
    chainId: 250,
    identifier: 'fantom'
  },
  // {
  //   name: 'Flare',
  //   subgraphEndpoint: '',
  //   chainId: 14,
  //   identifier: 'flare'
  // },
  {
    name: 'Blast',
    subgraphEndpoint: 'https://api.goldsky.com/api/public/project_clohj3ta78ok12nzs5m8yag0b/subgraphs/steer-protocol-blast/1.1.1/gn',
    chainId: 81457,
    identifier: 'blast'
  },
  {
    name: 'Mode',
    subgraphEndpoint: 'https://api.goldsky.com/api/public/project_clohj3ta78ok12nzs5m8yag0b/subgraphs/steer-protocol-mode/1.1.1/gn',
    chainId: 34443,
    identifier: 'mode'
  },
  {
    name: 'AstarzkEVM',
    subgraphEndpoint: 'https://subgraph.steer.finance/astarzkevm/subgraphs/name/steerprotocol/steer-astarzkevm',
    chainId: 3776,
    identifier: 'astrzk'
  },
  {
    name: 'Telos',
    subgraphEndpoint: 'https://api.goldsky.com/api/public/project_clohj3ta78ok12nzs5m8yag0b/subgraphs/steer-protocol-telos/1.0.1/gn',
    chainId: 40,
    identifier: 'telos'
  },
  {
    name: 'X Layer',
    subgraphEndpoint: 'https://api.goldsky.com/api/public/project_clohj3ta78ok12nzs5m8yag0b/subgraphs/steer-protocol-x-layer/1.0.1/gn',
    chainId: 196,
    identifier: 'xlayer'
  },
  // {
  //   name: 'Celo',
  //   subgraphEndpoint: sdk.graph.modifyEndpoint('DDwt4z55qLHPNmasiQXFH3nRjgCBrBhsiz3uEqKRJoa'),
  //   chainId: 42220,
  //   identifier: 'celo'
  // },
]

// Fetch active vaults and associated data @todo limited to 1000 per chain
const query = `{vaults(first: 1000, where: {totalLPTokensIssued_not: "0", lastSnapshot_not: "0"}) {id}}`

supportedChains.forEach(chain => {
  module.exports[chain.identifier] = {
    tvl: async (api) => {
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

module.exports.arbitrum.staking = stakings(
  [
    "0xB10aB1a1C0E3E9697928F05dA842a292310b37f1",
    "0x25Ef108B328Cf752F0E0b0169D499Db164173763",
    "0x0b619438d1E8b8c205656502de59Af2Af71C43e0",
    "0xaCdC6fC8F84fbA26f065489a7bf5837D7CDf546F",
    "0xff46e1B60dD9De89Aa04902D5c3c5ca01f8576A4",
    "0x1E6a358a1721e0D2B84f39FD328FC03A1b6e863B"
  ], 
  "0x1C43D05be7E5b54D506e3DdB6f0305e8A66CD04e",
  "arbitrum"
)
