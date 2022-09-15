const axios = require("axios");
const retry = require('../helper/retry');
const { chainExports } = require('../helper/exports');
const { sumTokens } = require("../helper/unwrapLPs");
let dataCache = require('./dataCache.json')

const chainIds = {
  ethereum: 1,
  polygon: 137,
  bsc: 56,
  arbitrum: 42161,
  avax: 43114
}

let dataCacheUpdating

async function updateDataCache() {

  const http_api_url = 'https://api.hashflow.com/internal/pool/getPools';
  const null_addr = '0x0000000000000000000000000000000000000000';
  const allChainData = {}

  for (const chain of Object.keys(chainIds)) {
    const chainId = chainIds[chain]
    const url = `${http_api_url}?networkId=${chainId}&lp=${null_addr}`
    const pools_response = (await retry(async () => await axios.get(url))).data
    allChainData[chain] = pools_response.pools.map(pool =>
    ({
      pool: pool.pool,
      tokens: pool.tokens.map(t => t.token.address)
    })
    )
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

module.exports = chainExports(chainTvl, Object.keys(chainIds)),
  module.exports.methodology = 'Hashflow TVL is made of all pools token balances. Pools and their tokens are retrieved by Hashflow HTTP REST API.'
module.exports.broken = 'Server IP is blocked, so api call fails'