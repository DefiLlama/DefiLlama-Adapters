const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require('../helper/http') 
const { sumTokens } = require("../helper/unwrapLPs");
let dataCache = require('./dataCache.json')

const chainIds = {
  ethereum: 1,
  polygon: 137,
  bsc: 56,
  arbitrum: 42161,
  avax: 43114,
  optimism: 10,
}

let dataCacheUpdating

async function updateDataCache() {
  const null_addr = ADDRESSES.null;
  const allChainData = {}

  for (const chain of Object.keys(chainIds)) {
    const chainId = chainIds[chain]
    const url = `https://api.hashflow.com/internal/pools?networkId=${chainId}&lp=${null_addr}`
    const pools_response = await get(url)
    // const pools_response = data[chain]
    pools_response.pools = pools_response.pools.filter(i => !i.name.startsWith('HFT Bridge'))
    allChainData[chain] = pools_response.pools.map(pool =>
    ({
      pool: pool.pool,
      tokens: pool.tokens.map(t => t.token.address)
    })
    )

    // const blacklisted = ['0x5e1fed30b85fcfcd725902bb5de0d50901faa70d', '0xa97a7a07e063bb812e1ae22a98a18d1dbb5176f4', ]
    // allChainData[chain] = allChainData[chain].filter(i => !blacklisted.includes(i.pool.toLowerCase()))
  }

  require('fs').writeFileSync(__dirname + '/dataCache.json', JSON.stringify(allChainData, null, 2))
  dataCache = allChainData
}

function chainTvl(chain) {
  return async (timestamp, ethBlock, { [chain]: block }) => {
    // if (!dataCacheUpdating) dataCacheUpdating = updateDataCache()
    // await dataCacheUpdating

    const pools = dataCache[chain]
    const tokensAndOwners = pools.map(p => p.tokens.map(t => [t, p.pool])).flat()
    return sumTokens({}, tokensAndOwners, block, chain);
  }
}

  module.exports.methodology = 'Hashflow TVL is made of all pools token balances. Pools and their tokens are retrieved by Hashflow HTTP REST API.'
module.exports.broken = 'Server IP is blocked, so api call fails'


Object.keys(chainIds).forEach(chain => {
  module.exports[chain] = { tvl: chainTvl(chain) }
})