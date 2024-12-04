const sdk = require("@defillama/sdk");
// const { cachedGraphQuery } = require('../helper/cache')
const { stakings } = require("../helper/staking");
const Bucket = "tvl-adapter-cache";
const axios = require('axios')
const graphql = require('../helper/utils/graphql')


const supportedChains = [
  {
    name: 'Polygon',
    subgraphEndpoint: 'https://api.goldsky.com/api/public/project_clohj3ta78ok12nzs5m8yag0b/subgraphs/steer-protocol-polygon/1.1.1/gn',
    chainId: 137,
    identifier: 'polygon'
  },
  {
    name: 'Arbitrum',
    subgraphEndpoint: 'https://api.goldsky.com/api/public/project_clohj3ta78ok12nzs5m8yag0b/subgraphs/steer-protocol-arbitrum/1.1.0/gn',
    chainId: 42161,
    identifier: 'arbitrum'
  },
  {
    name: 'Optimism',
    subgraphEndpoint: 'https://subgraph-proxy-server-xf2uthetka-as.a.run.app/gateway-arbitrum/GgW1EwNARL3dyo3acQ3VhraQQ66MHT7QnYuGcQc5geDG',
    chainId: 10,
    identifier: 'optimism'
  },
  {
    name: 'Binance',
    subgraphEndpoint: 'https://subgraph-proxy-server-xf2uthetka-as.a.run.app/gateway-arbitrum/GLDP56fPGDz3MtmhtfTkz5CxWiqiNLACVrsJ9RqQeL4U',
    chainId: 56,
    identifier: 'bsc'
  },
  // {
  //   name: 'Evmos',
  //   subgraphEndpoint: 'https://subgraph.satsuma-prod.com/769a117cc018/steer/steer-protocol-evmos/api',
  //   chainId: 9001,
  //   identifier: 'evmos'
  // },
  {
    name: 'Avalanche',
    subgraphEndpoint: 'https://subgraph-proxy-server-xf2uthetka-as.a.run.app/gateway-arbitrum/GZotTj3rQJ8ZqVyodtK8TcnKcUxMgeF7mCJHGPYbu8dA',
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
    subgraphEndpoint: 'https://api.goldsky.com/api/public/project_clohj3ta78ok12nzs5m8yag0b/subgraphs/steer-protocol-linea/1.1.2/gn',
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
    subgraphEndpoint: 'https://api.goldsky.com/api/public/project_clohj3ta78ok12nzs5m8yag0b/subgraphs/steer-protocol-scroll/1.1.1/gn',
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
    subgraphEndpoint: 'https://subgraph-proxy-server-xf2uthetka-as.a.run.app/gateway-arbitrum/9uyX2WDuaxmcYh11ehUhU68M9uSCp5FXVQV2w4LqbpbV',
    chainId: 250,
    identifier: 'fantom'
  },
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
    subgraphEndpoint: 'https://api.goldsky.com/api/public/project_clohj3ta78ok12nzs5m8yag0b/subgraphs/steer-protocol-astar-zkevm/1.1.1/gn',
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
  {
    name: 'Rootstock',
    subgraphEndpoint: 'https://api.goldsky.com/api/public/project_clohj3ta78ok12nzs5m8yag0b/subgraphs/steer-protocol-rootstock/1.1.1/gn',
    chainId: 30,
    identifier: 'rsk'
  },
  {
    name: 'Celo',
    subgraphEndpoint: 'https://api.goldsky.com/api/public/project_clohj3ta78ok12nzs5m8yag0b/subgraphs/steer-protocol-celo/1.1.1/gn',
    chainId: 42220,
    identifier: 'celo'
  },
  {
    name: 'ZklinkNova',
    subgraphEndpoint: 'https://api.goldsky.com/api/public/project_clohj3ta78ok12nzs5m8yag0b/subgraphs/steer-protocol-zklink-nova/1.0.1/gn',
    chainId: 810180,
    identifier: 'zklink'
  },
  {
    name: 'Flare',
    subgraphEndpoint: 'https://api.goldsky.com/api/public/project_clohj3ta78ok12nzs5m8yag0b/subgraphs/steer-protocol-flare/1.1.1/gn',
    chainId: 14,
    identifier: 'flare'
  },
  {
    name: 'ApeChain',
    subgraphEndpoint: 'https://api.goldsky.com/api/public/project_clohj3ta78ok12nzs5m8yag0b/subgraphs/steer-protocol-apechain/1.1.1/gn',
    chainId: 33139,
    identifier: 'apechain'
  },
  // {
  //   name: 'Bittorrent',
  //   subgraphEndpoint: 'https://api.goldsky.com/api/public/project_clohj3ta78ok12nzs5m8yag0b/subgraphs/steer-protocol-btt/1.1.1/gn',
  //   chainId: 199,
  //   identifier: 'bittorrent'
  // },
  {
    name: 'Filecoin',
    subgraphEndpoint:  'https://fil.subgraph.laconic.com/v1/steer-protocol/iRoheeEh2g6CdZ9OnunLwNCFHG8a7TAdtIYNNxboRSKVxgZfjq',
    chainId: 314,
    identifier: 'filecoin'
  },
  {
    name: 'Zircuit',
    subgraphEndpoint:  'https://app.sentio.xyz/api/v1/graphql/rakesh/steer-protocol-zircuit',
    headers: {'api-key': 'yu0Dep8seTmFjvlmAXN1ILNggARnx74MB'
    },
    chainId: 48900,
    identifier: 'zircuit'
  },
]

// Fetch active vaults and associated data @todo limited to 1000 per chain
const query = `{vaults(first: 1000, where: {totalLPTokensIssued_not: "0", lastSnapshot_not: "0"}) {id}}`
const z_query = `{
  vaults(first: 1000, where: {lastSnapshot_gte: "0", totalLPTokensIssued_gt: "0"}) {
    id
  }
}`

supportedChains.forEach(chain => {
  module.exports[chain.identifier] = {
    tvl: async (api) => {
      const data = await cachedGraphQuery('steer/' + chain.identifier, chain.subgraphEndpoint, chain.chainId == 48900 ? z_query : query, {headers: chain.headers || {}},)

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


async function cachedGraphQuery(project, endpoint, query, { api, useBlock = false, variables = {}, fetchById, safeBlockLimit, headers = {} } = {}) {
  if (!project || !endpoint) throw new Error('Missing parameters');
  endpoint = sdk.graph.modifyEndpoint(endpoint);
  const key = 'config-cache';
  const cacheKey = getKey(key, project);
  if (!configCache[cacheKey]) configCache[cacheKey] = _cachedGraphQuery();
  return configCache[cacheKey];

  async function _cachedGraphQuery() {
    try {
      let json;
      if (useBlock && !variables.block && !fetchById) {
        if (!api) throw new Error('Missing parameters');
        variables.block = await api.getBlock();
      }

      if (!fetchById) {
        const rawRequest = {
          url: endpoint,
          method: 'POST',
          headers,
          body: { query, variables },
        };
        const { data: result } = await axios.post(
          endpoint,
          { query, variables },
          { headers }
        );

        if (result.errors) throw new Error(result.errors[0].message);
        json = result.data;
      } else {
        json = await graphFetchById({
          endpoint,
          query,
          params: variables,
          api,
          headers,
          options: { useBlock, safeBlockLimit },
        });
      }

      if (!json) throw new Error('Empty JSON');
      await _setCache(key, project, json);
      return json;
    } catch (e) {
      sdk.log(project, 'trying to fetch from cache, failed to fetch data from endpoint:', endpoint);
      return getCache(key, project, { headers });
    }
  }
}

module.exports.arbitrum.staking = stakings(
  [
    "0xB10aB1a1C0E3E9697928F05dA842a292310b37f1",
    "0x25Ef108B328Cf752F0E0b0169D499Db164173763",
    "0x0b619438d1E8b8c205656502de59Af2Af71C43e0",
    "0xaCdC6fC8F84fbA26f065489a7bf5837D7CDf546F",
    "0xff46e1B60dD9De89Aa04902D5c3c5ca01f8576A4",
    "0x1E6a358a1721e0D2B84f39FD328FC03A1b6e863B",
    "0x3338B85fB1607C519962571B67061e02408475Bb",
    "0x6519A921d0E6F06524eff5DF976abc9A3ABF36cF"
  ], 
  "0x1C43D05be7E5b54D506e3DdB6f0305e8A66CD04e",
  "arbitrum"
)

// Imported cache 

function getKey(project, chain) {
  return `cache/${project}/${chain}.json`
}

function getFileKey(project, chain) {
  return `${Bucket}/${getKey(project, chain)}`
}

function getLink(project, chain) {
  return `https://${Bucket}.s3.eu-central-1.amazonaws.com/${getKey(project, chain)}`
}

async function getCache(project, chain, { _ } = {}) {
  const Key = getKey(project, chain)
  const fileKey = getFileKey(project, chain)

  try {
    const json = await sdk.cache.readCache(fileKey)
    if (!json || Object.keys(json).length === 0) throw new Error('Invalid data')
    return json
  } catch (e) {
    try {
      const { data: json } = await axios.get(getLink(project, chain))
      await sdk.cache.writeCache(fileKey, json)
      return json
    } catch (e) {
      sdk.log('failed to fetch data from s3 bucket:', Key)
      // sdk.log(e)
      return {}
    }
  }
}

async function setCache(project, chain, cache) {
  const Key = getKey(project, chain)

  try {
    await sdk.cache.writeCache(getFileKey(project, chain), cache)
  } catch (e) {
    sdk.log('failed to write data to s3 bucket: ', Key)
    sdk.log(e)
  }
}

const configCache = {}

async function _setCache(project, chain, json) {
  if (!json || json?.error?.message) return;
  const strData = typeof json === 'string' ? json : JSON.stringify(json)
  let isValidData = strData.length > 42
  if (isValidData) // sometimes we get bad data/empty object, we dont overwrite cache with it
    await setCache(project, chain, json)
}

async function getConfig(project, endpoint, { fetcher } = {}) {
  if (!project || (!endpoint && !fetcher)) throw new Error('Missing parameters')
  const key = 'config-cache'
  const cacheKey = getKey(key, project)
  if (!configCache[cacheKey]) configCache[cacheKey] = _getConfig()
  return configCache[cacheKey]

  async function _getConfig() {
    try {
      let json
      if (endpoint) {
        json = (await axios.get(endpoint)).data
      } else {
        json = await fetcher()
      }
      if (!json) throw new Error('Invalid data')
      await _setCache(key, project, json)
      return json
    } catch (e) {
      // sdk.log(e)
      sdk.log(project, 'tryng to fetch from cache, failed to fetch data from endpoint:', endpoint)
      return getCache(key, project)
    }
  }
}

async function configPost(project, endpoint, data) {
  if (!project || !endpoint) throw new Error('Missing parameters')
  const key = 'config-cache'
  const cacheKey = getKey(key, project)
  if (!configCache[cacheKey]) configCache[cacheKey] = _configPost()
  return configCache[cacheKey]

  async function _configPost() {
    try {
      const { data: json } = await axios.post(endpoint, data)
      await _setCache(key, project, json)
      return json
    } catch (e) {
      // sdk.log(e)
      sdk.log(project, 'tryng to fetch from cache, failed to fetch data from endpoint:', endpoint)
      return getCache(key, project)
    }
  }
}


// async function cachedGraphQuery(project, endpoint, query, { api, useBlock = false, variables = {}, fetchById, safeBlockLimit, } = {}) {
//   if (!project || !endpoint) throw new Error('Missing parameters')
//   endpoint = sdk.graph.modifyEndpoint(endpoint)
//   const key = 'config-cache'
//   const cacheKey = getKey(key, project)
//   if (!configCache[cacheKey]) configCache[cacheKey] = _cachedGraphQuery()
//   return configCache[cacheKey]

//   async function _cachedGraphQuery() {
//     try {
//       let json
//       if (useBlock && !variables.block  && !fetchById) {
//         if (!api) throw new Error('Missing parameters')
//         variables.block = await api.getBlock()
//       }
//       if (!fetchById)
//         json = await graphql.request(endpoint, query, { variables })
//       else 
//         json = await graphFetchById({ endpoint, query, params: variables, api, options: { useBlock, safeBlockLimit } })
//       if (!json) throw new Error('Empty JSON')
//       await _setCache(key, project, json)
//       return json
//     } catch (e) {
//       // sdk.log(e)
//       sdk.log(project, 'tryng to fetch from cache, failed to fetch data from endpoint:', endpoint)
//       return getCache(key, project)
//     }
//   }
// }


async function graphFetchById({  endpoint, query, params = {}, api, options: { useBlock = false, safeBlockLimit = 500 } = {} }) {
  if (useBlock && !params.block)
    params.block = await api.getBlock() - safeBlockLimit
  endpoint = sdk.graph.modifyEndpoint(endpoint)

  let data = []
  let lastId = ""
  let response;
  do {
    const res = await graphql.request(endpoint, query, { variables: { ...params, lastId }})
    Object.keys(res).forEach(key => response = res[key])
    data.push(...response)
    lastId = response[response.length - 1]?.id
    sdk.log(data.length, response.length)
  } while (lastId)
  return data
}
