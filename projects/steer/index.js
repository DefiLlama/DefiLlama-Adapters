const sdk = require("@defillama/sdk");
const { cachedGraphQuery } = require('../helper/cache')
const { stakings } = require("../helper/staking");

const OFFLINE_SUBGRAPH_URL_PREFIX = 'https://subgraph-archive.steer.finance/graphql/'
const offlineSubgraphUrl = (chain) => `${OFFLINE_SUBGRAPH_URL_PREFIX}${chain}`

const supportedChains = [
  {
    name: 'Polygon',
    subgraphEndpoint:
      'https://api.subgraph.ormilabs.com/api/public/803c8c8c-be12-4188-8523-b9853e23051d/subgraphs/steer-protocol-polygon/prod/gn',
    chainId: 137,
    identifier: 'polygon'
  },
  {
    name: 'Arbitrum',
    subgraphEndpoint:
      'https://api.subgraph.ormilabs.com/api/public/803c8c8c-be12-4188-8523-b9853e23051d/subgraphs/steer-protocol-arbitrum/prod/gn',
    chainId: 42161,
    identifier: 'arbitrum'
  },
  {
    name: 'Optimism',
    subgraphEndpoint:
      'https://subgraph-proxy-server-xf2uthetka-as.a.run.app/gateway-arbitrum/GgW1EwNARL3dyo3acQ3VhraQQ66MHT7QnYuGcQc5geDG',
    chainId: 10,
    identifier: 'optimism'
  },
  {
    name: 'Binance',
    subgraphEndpoint:
      'https://api.subgraph.ormilabs.com/api/public/803c8c8c-be12-4188-8523-b9853e23051d/subgraphs/steer-protocol-bsc-beta/prod/gn',
    chainId: 56,
    identifier: 'bsc'
  },
  {
    name: 'Bittensor',
    subgraphEndpoint: 'https://subgraph.35-247-158-26.sslip.io/subgraphs/name/steer-subgraph',
    chainId: 964,
    identifier: 'bittensor_evm'
  },
  {
    name: 'Evmos',
    subgraphEndpoint: offlineSubgraphUrl('evmos'),
    chainId: 9001,
    identifier: 'evmos'
  },
  {
    name: 'Avalanche',
    subgraphEndpoint:
      'https://subgraph-proxy-server-xf2uthetka-as.a.run.app/gateway-arbitrum/GZotTj3rQJ8ZqVyodtK8TcnKcUxMgeF7mCJHGPYbu8dA',
    chainId: 43114,
    identifier: 'avax'
  },
  {
    name: 'Thundercore',
    subgraphEndpoint: offlineSubgraphUrl('thundercore'),
    chainId: 108,
    identifier: 'thundercore'
  },
  {
    name: 'Kava',
    subgraphEndpoint: offlineSubgraphUrl('kava'),
    chainId: 2222,
    identifier: 'kava'
  },
  {
    name: 'Base',
    subgraphEndpoint:
      'https://api.subgraph.ormilabs.com/api/public/803c8c8c-be12-4188-8523-b9853e23051d/subgraphs/steer-protocol-base/beta/gn',
    chainId: 8453,
    identifier: 'base'
  },
  {
    name: 'Linea',
    subgraphEndpoint:
      'https://api.subgraph.ormilabs.com/api/public/803c8c8c-be12-4188-8523-b9853e23051d/subgraphs/steer-protocol-linea/prod/gn',
    chainId: 59144,
    identifier: 'linea'
  },
  {
    name: 'Metis',
    subgraphEndpoint: offlineSubgraphUrl('metis'),
    chainId: 1088,
    identifier: 'metis'
  },
  {
    name: 'Manta',
    subgraphEndpoint: offlineSubgraphUrl('manta'),
    chainId: 169,
    identifier: 'manta'
  },
  {
    name: 'PolygonZKEVM',
    subgraphEndpoint: offlineSubgraphUrl('zkevm'),
    chainId: 1101,
    identifier: 'polygon_zkevm'
  },
  {
    name: 'Scroll',
    subgraphEndpoint: offlineSubgraphUrl('scroll'),
    chainId: 534352,
    identifier: 'scroll'
  },
  {
    name: 'Mantle',
    subgraphEndpoint: offlineSubgraphUrl('mantle'),
    chainId: 5000,
    identifier: 'mantle'
  },
  {
    name: 'Astar',
    subgraphEndpoint: offlineSubgraphUrl('astar'),
    chainId: 4369,
    identifier: 'astar'
  },
  {
    name: 'Fantom',
    subgraphEndpoint: offlineSubgraphUrl('fantom'),
    chainId: 250,
    identifier: 'fantom'
  },
  {
    name: 'Blast',
    subgraphEndpoint: offlineSubgraphUrl('blast'),
    chainId: 81457,
    identifier: 'blast'
  },
  {
    name: 'Mode',
    subgraphEndpoint: offlineSubgraphUrl('mode'),
    chainId: 34443,
    identifier: 'mode'
  },

  // {
  //   name: 'AstarzkEVM',
  //   subgraphEndpoint: offlineSubgraphUrl('astarzkevm'),
  //   chainId: 3776,
  //   identifier: 'astrzk'
  // },

  {
    name: 'Telos',
    subgraphEndpoint: offlineSubgraphUrl('telos'),
    chainId: 40,
    identifier: 'telos'
  },
  {
    name: 'X Layer',
    subgraphEndpoint: offlineSubgraphUrl('xlayer'),
    chainId: 196,
    identifier: 'xlayer'
  },
  {
    name: 'Rootstock',
    subgraphEndpoint:
      'https://api.goldsky.com/api/public/project_cm2k9xbkz4qg901vs51bm5uau/subgraphs/steer-protocol-rootstock/prod/gn',
    chainId: 30,
    identifier: 'rsk'
  },
  {
    name: 'Celo',
    subgraphEndpoint:
      'https://subgraph-proxy-server-xf2uthetka-as.a.run.app/gateway-arbitrum/BPaFHyfVrhv3pdjGodpQcWggAg1Bcrvc9SFc2t2BXeho',
    chainId: 42220,
    identifier: 'celo'
  },
  {
    name: 'ZklinkNova',
    subgraphEndpoint: offlineSubgraphUrl('zklinknova'),
    chainId: 810180,
    identifier: 'zklink'
  },
  {
    name: 'Flare',
    subgraphEndpoint:
      'https://api.goldsky.com/api/public/project_cm2k9xbkz4qg901vs51bm5uau/subgraphs/steer-protocol-flare/prod/gn',
    chainId: 14,
    identifier: 'flare'
  },
  {
    name: 'ApeChain',
    subgraphEndpoint: offlineSubgraphUrl('apechain'),
    chainId: 33139,
    identifier: 'apechain'
  },

  // {
  //   name: 'Bittorrent',
  //   subgraphEndpoint:
  //     'https://api.goldsky.com/api/public/project_clohj3ta78ok12nzs5m8yag0b/subgraphs/steer-protocol-btt/1.1.1/gn',
  //   chainId: 199,
  //   identifier: 'bittorrent'
  // },

  {
    name: 'Filecoin',
    subgraphEndpoint: offlineSubgraphUrl('filecoin'),
    chainId: 314,
    identifier: 'filecoin'
  },
  {
    name: 'Zircuit',
    subgraphEndpoint: offlineSubgraphUrl('zircuit'),
    chainId: 48900,
    identifier: 'zircuit'
  },
  {
    name: 'Sonic',
    subgraphEndpoint: offlineSubgraphUrl('sonic'),
    chainId: 146,
    identifier: 'sonic'
  },
  {
    name: 'Moonbeam',
    subgraphEndpoint: offlineSubgraphUrl('moonbeam'),
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
    name: 'Taiko',
    subgraphEndpoint: offlineSubgraphUrl('taiko'),
    chainId: 167000,
    identifier: 'taiko'
  },
  {
    name: 'Zetachain',
    subgraphEndpoint: offlineSubgraphUrl('zeta'),
    chainId: 7000,
    identifier: 'zeta'
  },
  {
    name: 'Soneium',
    subgraphEndpoint: offlineSubgraphUrl('soneium'),
    chainId: 1868,
    identifier: 'soneium'
  },
  {
    name: 'Bera',
    subgraphEndpoint:
      'https://api.subgraph.ormilabs.com/api/public/803c8c8c-be12-4188-8523-b9853e23051d/subgraphs/steer-protocol-bera/prod/gn',
    chainId: 80094,
    identifier: 'berachain'
  },
  {
    name: 'Ethereum',
    subgraphEndpoint:
      'https://api.subgraph.ormilabs.com/api/public/803c8c8c-be12-4188-8523-b9853e23051d/subgraphs/steer-protocol-mainnet/prod/gn',
    chainId: 1,
    identifier: 'ethereum'
  },
  {
    name: 'Hemi',
    subgraphEndpoint: offlineSubgraphUrl('hemi'),
    chainId: 43111,
    identifier: 'hemi'
  },
  {
    name: 'Unichain',
    subgraphEndpoint:
      'https://api.goldsky.com/api/public/project_cmnrgd4exaie801sa45a1609h/subgraphs/steer-protocol-unichain/prod/gn',
    chainId: 130,
    identifier: 'unichain'
  },
  {
    name: 'Katana',
    subgraphEndpoint:
      'https://api.subgraph.ormilabs.com/api/public/803c8c8c-be12-4188-8523-b9853e23051d/subgraphs/steer-protocol-katana/prod/gn',
    chainId: 747474,
    identifier: 'katana'
  },
  {
    name: 'Saga',
    subgraphEndpoint: offlineSubgraphUrl('saga'),
    chainId: 5464,
    identifier: 'saga'
  },
  {
    name: 'Ronin',
    subgraphEndpoint: offlineSubgraphUrl('ronin'),
    chainId: 2020,
    identifier: 'ronin'
  },
  {
    name: 'Nibiru',
    subgraphEndpoint: offlineSubgraphUrl('nibiru'),
    chainId: 6900,
    identifier: 'nibiru'
  },
  {
    name: 'HyperEVM',
    subgraphEndpoint:
      'https://api.subgraph.ormilabs.com/api/public/803c8c8c-be12-4188-8523-b9853e23051d/subgraphs/steer-protocol-hyperevm/prod/gn',
    chainId: 999,
    identifier: 'hyperliquid'
  }
]

const query = `
  query getVaults {
    vaults(
      first: 1000
      orderBy: id
      orderDirection: asc
    ) { id beaconName token0 token1 token0Balance token1Balance }
  }
`

const OFFLINE_SUBGRAPH_QUERY = `
  query getVaults {
    vaults(
      first: 1000
      orderBy: id
      orderDirection: asc
    ) { id beaconName token0 token1 token0Balance token1Balance }
  }
`

const UNISWAP_V4_BEACON_NAMES = new Set([
  'UniswapV4Hook',
  'MultiPositionUniHookTest',
  'MultiPositionReserveV4',
  'MultiPositionUniswapV4',
])

const STEER_PERIPHERIES = {
  apechain: '0xd5532a58E4ABB6485FF4e7BCf5bED278e32A516e',
  arbitrum: '0x806c2240793b3738000fcb62C66BF462764B903F',
  astrzk: '0x37Cff062D52Dd6E9E39Df619CCd30c037a36bB83',
  astar: '0x1afD31627170607657224eD4aE701470209C4B2e',
  avax: '0x5D8249e3F5f702e1Fd720167b40424fc2daDCd1e',
  base: '0x16BA7102271dC83Fff2f709691c2B601DAD7668e',
  berachain: '0x71bE4708C86B8AFd6Aa47929Ce073e400B5B7747',
  bittensor_evm: '0x83ee3e4Bcac37f69C133f908E5a704eA9b7d74Eb',
  blast: '0xdca3251Ebe8f85458E8d95813bCb816460e4bef1',
  bsc: '0xe240B9a2936f6Fb8860219bC059349e50F03492e',
  celo: '0xdca3251Ebe8f85458E8d95813bCb816460e4bef1',
  ethereum: '0xCEBF1A54A9Ce703FC80967760b5A6cbDb4111099',
  evmos: '0x1afD31627170607657224eD4aE701470209C4B2e',
  fantom: '0xcb77e4C30D92c8b959811E99213625C7b9490b96',
  filecoin: '0xab36D30C1A1C683037Bd7AAC67f29B2e3ECC6576',
  flare: '0x7Daa68204232a78dBF1Dd853a4018330EE934A39',
  hemi: '0xd47CE509bE01e62cd4629E2f1eb22BA04e7dA192',
  hyperliquid: '0x40CA241eE876caF5BFa9c0724069f082473a6fFC',
  katana: '0x4DE18F1582Aa71671828F329B826ad45B2798b12',
  kava: '0xf90107890B640387ec3b0474F0c61674AEbCb510',
  linea: '0x0C5c5BEB833fD382b04e039f151942DC3D9A60ce',
  manta: '0xD90c8970708FfdFC403bdb56636621e3E9CCe921',
  mantle: '0x36C796BcA1E8E4031D3FdFA1ff0FA5EF429e0ED2',
  metis: '0x806c2240793b3738000fcb62C66BF462764B903F',
  mode: '0x16BA7102271dC83Fff2f709691c2B601DAD7668e',
  moonbeam: '0xa4a2f232C92f2DE7181E9fe4d46297FbBb4afaaA',
  nibiru: '0xcb77e4C30D92c8b959811E99213625C7b9490b96',
  optimism: '0x7c464A0AB1f5ebf3E2dCccfec7EF41D02ED7a2f4',
  polygon: '0x29E1888F7DD0757f2873E494463Ec389dab38D27',
  polygon_zkevm: '0xcA19bEc25A41443F35EeAE03411Dce87D8c0Edc4',
  ronin: '0x7bb362141BB277C7609519e9fBA4927A5e2e5cC7',
  rsk: '0x37Cff062D52Dd6E9E39Df619CCd30c037a36bB83',
  saga: '0x4Cb98E1eeef513086B6a724f6B5401031b125649',
  scroll: '0xD90c8970708FfdFC403bdb56636621e3E9CCe921',
  sei: '0xfF42cD42d8a5812CB38fb3C0720Dfc490912f48B',
  soneium: '0x1e5Fd638E8BF242Ae2a5bdd9ABBfd2681D25aDDC',
  sonic: '0xb95572432c935f62E25376280724FDbAD9F8F755',
  taiko: '0xD40699A642172DeD33BCFe4E3F84D54610C757Cd',
  telos: '0x16BA7102271dC83Fff2f709691c2B601DAD7668e',
  thundercore: '0xab36D30C1A1C683037Bd7AAC67f29B2e3ECC6576',
  unichain: '0x01ffCeBd15e2EfFD96ba1c3014c9260ecB575823',
  xlayer: '0xab36D30C1A1C683037Bd7AAC67f29B2e3ECC6576',
  zeta: '0x42D1316c1ce4E0f143C12771004AFb91a03CaF6d',
  zircuit: '0xD90c8970708FfdFC403bdb56636621e3E9CCe921',
  zklink: '0x525b443C8d2D0aA8Bd70d22177EC6250286b9708',
}

function addBalances(api, balances, token0s, token1s, [balance0, balance1], fallbackBalances = []) {
  const length = Math.max(balances.length, fallbackBalances.length)
  for (let i = 0; i < length; i++) {
    const balance = balances[i]
    const token0 = token0s[i]
    const token1 = token1s[i]
    if (balance && token0 && token1) {
      api.add(token0, balance[balance0])
      api.add(token1, balance[balance1])
      continue
    }

    const fallback = fallbackBalances[i]
    if (!fallback?.token0 || !fallback?.token1) continue
    api.add(fallback.token0, fallback.token0Balance)
    api.add(fallback.token1, fallback.token1Balance)
  }
}

function getV4MetadataToken(metadata, index) {
  if (typeof metadata !== 'string' || !/^0x[\da-f]{128,}$/i.test(metadata)) return
  const token = `0x${metadata.slice(2 + index * 64 + 24, 2 + (index + 1) * 64)}`
  return token === '0x0000000000000000000000000000000000000000' ? undefined : token
}

supportedChains.forEach(chain => {
  module.exports[chain.identifier] = {
    tvl: async (api) => {
      const usesOfflineSubgraph = chain.subgraphEndpoint.startsWith(OFFLINE_SUBGRAPH_URL_PREFIX)
      const data = await cachedGraphQuery(`steer-v4/${chain.identifier}`, chain.subgraphEndpoint, usesOfflineSubgraph ? OFFLINE_SUBGRAPH_QUERY : query, {
        headers: chain.headers,
      })
      // The array fallback supports a cache entry produced by the previous paginated query.
      const vaultData = Array.isArray(data) ? data : data.vaults
      if (!Array.isArray(vaultData)) throw new Error(`Could not fetch vaults for ${api.chain}`)
      const v4Vaults = vaultData.filter(({ beaconName }) => UNISWAP_V4_BEACON_NAMES.has(beaconName))
      const legacyVaults = vaultData.filter(({ beaconName }) => !UNISWAP_V4_BEACON_NAMES.has(beaconName))
      const vaults = legacyVaults.map(({ id }) => id)

      if (vaults.length) {
        try {
          const [bals, token0s, token1s] = await Promise.all([
            api.multiCall({ abi: 'function getTotalAmounts() view returns (uint256 total0, uint256 total1)', calls: vaults, permitFailure: true }),
            api.multiCall({ abi: 'address:token0', calls: vaults, permitFailure: true }),
            api.multiCall({ abi: 'address:token1', calls: vaults, permitFailure: true }),
          ])
          addBalances(api, bals, token0s, token1s, ['total0', 'total1'], legacyVaults)
        } catch (e) {
          console.warn(`Steer ${api.chain}: RPC balances unavailable; using subgraph snapshot balances`)
          addBalances(api, [], [], [], ['total0', 'total1'], legacyVaults)
        }
      }

      if (v4Vaults.length) {
        const steerPeriphery = STEER_PERIPHERIES[api.chain]
        if (!steerPeriphery) throw new Error(`Missing SteerPeriphery address for ${api.chain}`)

        const v4Addresses = v4Vaults.map(({ id }) => id)
        try {
          const [v4Balances, v4Metadata, fallbackToken0s, fallbackToken1s] = await Promise.all([
            api.multiCall({
              target: steerPeriphery,
              abi: 'function uniswapV4VaultBalancesByAddress(address vault) view returns (uint256 totalSupply, uint256 bal0, uint256 bal1)',
              calls: v4Addresses,
              permitFailure: true,
            }),
            api.multiCall({
              target: steerPeriphery,
              // The function returns a dynamic tuple. Its first two tuple fields are token0 and token1.
              abi: 'function uniswapV4VaultMetadataByAddress(address vault) view returns (bytes metadata)',
              calls: v4Addresses,
              permitFailure: true,
            }),
            api.multiCall({ abi: 'address:token0', calls: v4Addresses, permitFailure: true }),
            api.multiCall({ abi: 'address:token1', calls: v4Addresses, permitFailure: true }),
          ])
          addBalances(
            api,
            v4Balances,
            v4Metadata.map((metadata, i) => getV4MetadataToken(metadata, 0) ?? fallbackToken0s[i]),
            v4Metadata.map((metadata, i) => getV4MetadataToken(metadata, 1) ?? fallbackToken1s[i]),
            ['bal0', 'bal1'],
            v4Vaults,
          )
        } catch (e) {
          console.warn(`Steer ${api.chain}: UniV4 RPC balances unavailable; using subgraph snapshot balances`)
          addBalances(api, [], [], [], ['bal0', 'bal1'], v4Vaults)
        }
      }
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

const deadChains = ["thundercore"] 

deadChains.forEach(chain => {
  module.exports[chain] = {tvl: () => ({})}
})