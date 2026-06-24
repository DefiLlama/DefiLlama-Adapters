const sdk = require("@defillama/sdk");
const { cachedGraphQuery } = require('../helper/cache')
const { stakings } = require("../helper/staking");


const supportedChains = [
  {
    name: 'Polygon',
    subgraphEndpoint: 'https://api.subgraph.ormilabs.com/api/public/803c8c8c-be12-4188-8523-b9853e23051d/subgraphs/steer-protocol-polygon/prod/gn',
    chainId: 137,
    identifier: 'polygon'
  },
  {
    name: 'Binance',
    subgraphEndpoint: 'https://api.subgraph.ormilabs.com/api/public/803c8c8c-be12-4188-8523-b9853e23051d/subgraphs/steer-protocol-bsc-beta/prod/gn',
    chainId: 56,
    identifier: 'bsc'
  },
  {
    name: 'Optimism',
    subgraphEndpoint: 'https://subgraph-proxy-server-xf2uthetka-as.a.run.app/gateway-arbitrum/GgW1EwNARL3dyo3acQ3VhraQQ66MHT7QnYuGcQc5geDG',
    chainId: 10,
    identifier: 'optimism'
  },
  {
    name: 'Arbitrum',
    subgraphEndpoint: 'https://api.subgraph.ormilabs.com/api/public/803c8c8c-be12-4188-8523-b9853e23051d/subgraphs/steer-protocol-arbitrum/prod/gn',
    chainId: 42161,
    identifier: 'arbitrum'
  },
  // {
  //   name: 'Evmos',
  //   subgraphEndpoint: 'https://subgraph.satsuma-prod.com/769a117cc018/steer/steer-protocol-evmos/api',
  //   chainId: 9001,
  //   identifier: 'evmos'
  // },
  // {
  //   name: 'Thundercore',
  //   subgraphEndpoint: 'https://subgraph.steer.finance/thundercore/subgraphs/name/steerprotocol/steer-thundercore',
  //   chainId: 108,
  //   identifier: 'thundercore'
  // },
  {
    name: 'Metis',
    subgraphEndpoint: 'https://api.metis.0xgraph.xyz/api/public/b88b5696-b69d-46be-b212-5c55a9b1492f/subgraphs/steer-protocol-metis/prod/gn',
    chainId: 1088,
    identifier: 'metis'
  },
  {
    name: 'Base',
    subgraphEndpoint: 'https://api.subgraph.ormilabs.com/api/public/803c8c8c-be12-4188-8523-b9853e23051d/subgraphs/steer-protocol-base/prod/gn',
    chainId: 8453,
    identifier: 'base'
  },
  {
    name: 'Avalanche',
    subgraphEndpoint: 'https://subgraph-proxy-server-xf2uthetka-as.a.run.app/gateway-arbitrum/GZotTj3rQJ8ZqVyodtK8TcnKcUxMgeF7mCJHGPYbu8dA',
    chainId: 43114,
    identifier: 'avax'
  },
  {
    name: 'PolygonZKEVM',
    subgraphEndpoint: 'https://api.goldsky.com/api/public/project_clohj3ta78ok12nzs5m8yag0b/subgraphs/steer-protocol-polygon-zkevm/prod/gn',
    chainId: 1101,
    identifier: 'polygon_zkevm'
  },
  {
    name: 'Celo',
    subgraphEndpoint: 'https://subgraph-proxy-server-xf2uthetka-as.a.run.app/gateway-arbitrum/BPaFHyfVrhv3pdjGodpQcWggAg1Bcrvc9SFc2t2BXeho',
    chainId: 42220,
    identifier: 'celo'
  },
  {
    name: 'Kava',
    subgraphEndpoint: 'https://api.goldsky.com/api/public/project_clohj3ta78ok12nzs5m8yag0b/subgraphs/steer-protocol-kava/prod/gn',
    chainId: 2222,
    identifier: 'kava'
  },
  {
    name: 'Linea',
    subgraphEndpoint: 'https://api.subgraph.ormilabs.com/api/public/803c8c8c-be12-4188-8523-b9853e23051d/subgraphs/steer-protocol-linea/prod/gn',
    chainId: 59144,
    identifier: 'linea'
  },
  {
    name: 'Scroll',
    subgraphEndpoint: 'https://subgraph-proxy-server-xf2uthetka-as.a.run.app/gateway-arbitrum/822PfgbgBzC98Huwf37uxvF9YGZMA5nDeETpstkR55Sn',
    chainId: 534352,
    identifier: 'scroll'
  },
  {
    name: 'Manta',
    subgraphEndpoint: 'https://api.subgraph.ormilabs.com/api/public/803c8c8c-be12-4188-8523-b9853e23051d/subgraphs/steer-protocol-manta/prod/gn',
    chainId: 169,
    identifier: 'manta'
  },
  {
    name: 'Astar',
    subgraphEndpoint: 'https://api.goldsky.com/api/public/project_clohj3ta78ok12nzs5m8yag0b/subgraphs/steer-protocol-astar/prod/gn',
    chainId: 4369,
    identifier: 'astar'
  },
  {
    name: 'Fantom',
    subgraphEndpoint: 'https://subgraph-proxy-server-xf2uthetka-as.a.run.app/gateway-arbitrum/9uyX2WDuaxmcYh11ehUhU68M9uSCp5FXVQV2w4LqbpbV',
    chainId: 250,
    identifier: 'fantom'
  },
  {
    name: 'Mantle',
    subgraphEndpoint: 'https://subgraph-api.mantle.xyz/subgraphs/name/steerprotocol/steer-protocol-mantle',
    chainId: 5000,
    identifier: 'mantle'
  },
  {
    name: 'Blast',
    subgraphEndpoint: 'https://api.subgraph.ormilabs.com/api/public/803c8c8c-be12-4188-8523-b9853e23051d/subgraphs/steer-protocol-blast/prod/gn',
    chainId: 81457,
    identifier: 'blast'
  },
  {
    name: 'Mode',
    subgraphEndpoint: 'https://api.subgraph.ormilabs.com/api/public/803c8c8c-be12-4188-8523-b9853e23051d/subgraphs/steer-protocol-mode/prod/gn',
    chainId: 34443,
    identifier: 'mode'
  },
  {
    name: 'Telos',
    subgraphEndpoint: 'https://telos.api.ormilabs.com/api/public/39892398-bfdd-48ac-b776-77ad8a5b4b9e/subgraphs/steer-protocol-telos/prod/gn',
    chainId: 40,
    identifier: 'telos'
  },
  {
    name: 'X Layer',
    subgraphEndpoint: 'https://subgraph-proxy-server-xf2uthetka-as.a.run.app/gateway-arbitrum/8gCrUHrVS9rHwvDPLTn4Wz6od68ULb7azYuQz25JjRK3',
    chainId: 196,
    identifier: 'xlayer'
  },
  {
    name: 'Taiko',
    subgraphEndpoint: 'https://api.subgraph.ormilabs.com/api/public/803c8c8c-be12-4188-8523-b9853e23051d/subgraphs/steer-protocol-taiko/prod/gn',
    chainId: 167000,
    identifier: 'taiko'
  },
  {
    name: 'Rootstock',
    subgraphEndpoint: 'https://api.goldsky.com/api/public/project_cm2k9xbkz4qg901vs51bm5uau/subgraphs/steer-protocol-rootstock/prod/gn',
    chainId: 30,
    identifier: 'rsk'
  },
  {
    name: 'ZklinkNova',
    subgraphEndpoint: 'https://api.goldsky.com/api/public/project_cmmz9rcn2gc0j01w36xbo3wcn/subgraphs/steer-protocol-zklink-nova/prod/gn',
    chainId: 810180,
    identifier: 'zklink'
  },
  {
    name: 'Flare',
    subgraphEndpoint: 'https://api.goldsky.com/api/public/project_cm2k9xbkz4qg901vs51bm5uau/subgraphs/steer-protocol-flare/prod/gn',
    chainId: 14,
    identifier: 'flare'
  },
  {
    name: 'Filecoin',
    subgraphEndpoint: 'https://api.goldsky.com/api/public/project_cmmz8w4e274al01vsa0wa7cj3/subgraphs/steer-protocol-filecoin/prod/gn',
    chainId: 314,
    identifier: 'filecoin'
  },
  {
    name: 'ApeChain',
    subgraphEndpoint: 'https://apeapi.0xgraph.xyz/api/public/4ea21b03-9850-4796-8068-ec71bbe022db/subgraphs/steer-protocol-apechain/prod/gn',
    chainId: 33139,
    identifier: 'apechain'
  },
  {
    name: 'Zircuit',
    subgraphEndpoint: 'https://app.sentio.xyz/api/v1/graphql/rakesh/steer-protocol-zircuit?version=3',
    chainId: 48900,
    identifier: 'zircuit'
  },
  {
    name: 'Moonbeam',
    subgraphEndpoint: 'https://subgraph-proxy-server-xf2uthetka-as.a.run.app/gateway-arbitrum/4D2pLLQuGsAkdZAUgqxxnk4Mcu3aMjEV1HJ2F63kC7w6',
    chainId: 1284,
    identifier: 'moonbeam'
  },
  {
    name: 'Sei',
    subgraphEndpoint: 'https://subgraph-proxy-server-xf2uthetka-as.a.run.app/gateway-arbitrum/6uQm26z2NM2eV56sjZmVezUjBAC8jMx683B1cUencDwt',
    chainId: 1329,
    identifier: 'sei'
  },
  {
    name: 'Sonic',
    subgraphEndpoint: 'https://api.0xgraph.xyz/api/public/803c8c8c-be12-4188-8523-b9853e23051d/subgraphs/steer-protocol-sonic/prod/gn',
    chainId: 146,
    identifier: 'sonic'
  },
  {
    name: 'Zetachain',
    subgraphEndpoint: 'https://subgraph-proxy-server-xf2uthetka-as.a.run.app/gateway-arbitrum/HFH41DyzAXxYmT5eszVWn2T7UxViMroPJ4XJV8vhDGNN',
    chainId: 7000,
    identifier: 'zeta'
  },
  {
    name: 'Ethereum',
    subgraphEndpoint: 'https://api.subgraph.ormilabs.com/api/public/803c8c8c-be12-4188-8523-b9853e23051d/subgraphs/steer-protocol-mainnet/prod/gn',
    chainId: 1,
    identifier: 'ethereum'
  },
  {
    name: 'Soneium',
    subgraphEndpoint: 'https://subgraph-proxy-server-xf2uthetka-as.a.run.app/gateway-arbitrum/8gCrUHrVS9rHwvDPLTn4Wz6od68ULb7azYuQz25JjRK3',
    chainId: 1868,
    identifier: 'soneium'
  },
  {
    name: 'Bera',
    subgraphEndpoint: 'https://api.subgraph.ormilabs.com/api/public/803c8c8c-be12-4188-8523-b9853e23051d/subgraphs/steer-protocol-bera/prod/gn',
    chainId: 80094,
    identifier: 'berachain'
  },
  {
    name: 'Unichain',
    subgraphEndpoint: 'https://api.goldsky.com/api/public/project_cmnrgd4exaie801sa45a1609h/subgraphs/steer-protocol-unichain/prod/gn',
    chainId: 130,
    identifier: 'unichain'
  },
  {
    name: 'Hemi',
    subgraphEndpoint: 'https://subgraph-proxy-server-xf2uthetka-as.a.run.app/gateway-arbitrum/2eACJtEGuELqN5roUiHG1jqmCpXt5aimcc8xZdvtMv4z',
    chainId: 43111,
    identifier: 'hemi'
  },
  // {
  //   name: 'Core',
  //   subgraphEndpoint: 'https://thegraph.coredao.org/subgraphs/name/steer-protocol-core',
  //   chainId: 1116,
  //   identifier: 'core'
  // },
  {
    name: 'Katana',
    subgraphEndpoint: 'https://api.subgraph.ormilabs.com/api/public/803c8c8c-be12-4188-8523-b9853e23051d/subgraphs/steer-protocol-katana/prod/gn',
    chainId: 747474,
    identifier: 'katana'
  },
  {
    name: 'Ronin',
    subgraphEndpoint: 'https://subgraph-proxy-server-xf2uthetka-as.a.run.app/gateway-arbitrum/793Lz5oiK51wdm9kCLtHqunkAPk2qjg7denpCrHqrLcA',
    chainId: 2020,
    identifier: 'ronin'
  },
  {
    name: 'Saga',
    subgraphEndpoint: 'https://api.subgraph.ormilabs.com/api/public/803c8c8c-be12-4188-8523-b9853e23051d/subgraphs/steer-protocol-saga/prod/gn',
    chainId: 5464,
    identifier: 'saga'
  },
  {
    name: 'Nibiru',
    subgraphEndpoint: 'https://app.sentio.xyz//api/v1/graphql/rakesh/steer-protocol-nibiru',
    chainId: 6900,
    identifier: 'nibiru'
  },
  {
    name: 'HyperEVM',
    subgraphEndpoint: 'https://api.subgraph.ormilabs.com/api/public/803c8c8c-be12-4188-8523-b9853e23051d/subgraphs/steer-protocol-hyperevm/prod/gn',
    chainId: 999,
    identifier: 'hyperliquid'
  },
  {
    name: 'Bittensor',
    subgraphEndpoint: 'https://subgraph.35-247-158-26.sslip.io/subgraphs/name/steer-subgraph',
    chainId: 964,
    identifier: 'bittensor_evm'
  }
]

// Fetch active vaults and associated data @todo limited to 1000 per chain
const query = `{vaults(first: 1000, where: {totalLPTokensIssued_not: "0", lastSnapshot_not: "0"}) {id}}`
const z_query = `{  vaults(first: 1000, where: {lastSnapshot_gte: "0", totalLPTokensIssued_gt: "0"}) {    id  }}`

supportedChains.forEach(chain => {
  module.exports[chain.identifier] = {
    tvl: async (api) => {
      let _query = api.chain === 'zircuit' ? z_query : query
      const data = await cachedGraphQuery('steer/' + chain.identifier, chain.subgraphEndpoint, _query, { headers: chain.headers })

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
    "0x1E6a358a1721e0D2B84f39FD328FC03A1b6e863B",
    "0x3338B85fB1607C519962571B67061e02408475Bb",
    "0x6519A921d0E6F06524eff5DF976abc9A3ABF36cF",
    "0x004a733aA20ea2CaDdba6af62Bb56Aa96dCE4922",
    "0x78FE84c305c8Cd7E23186F2740b73915BAeADd52",
    "0x0635b76fc26c1d65bb2d761ee2fc4652e8bf5ca8",
    "0x3dC57204f2230c8D972653db0205199eb2bD7F38"
  ], 
  "0x1C43D05be7E5b54D506e3DdB6f0305e8A66CD04e",
  "arbitrum"
)

module.exports.base.staking = stakings(
  [
    "0x07536E7fBc498BD886D393fb693E71c8C4e45B97"
  ], 
  "0xFD1013c72CBB0FFB920D347C5836bF88965D0D5e",
  "base"
)
