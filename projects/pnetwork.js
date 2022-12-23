const querystring = require('querystring');
const { toUSDTBalances } = require('./helper/balances');
const { get } = require('./helper/http');

const data = {}

const HOURS_12 = 12 * 60 * 60 * 1000

function getTvl(timestamp) {
  const tsStr = ''+ timestamp
  if (!data[tsStr]) data[tsStr] = _getTvl()
  return data[tsStr]

  async function _getTvl() {
    timestamp = timestamp * 1e3
    const query = ` FROM "tvl_v2" WHERE time >= ${timestamp - HOURS_12}ms AND time <= ${timestamp + HOURS_12}ms GROUP BY time(1d)`
    const queryObj = {
      q: `SELECT sum("tvl_number")${query}, "host_blockchain";SELECT sum("tvl_number")${query} fill(null)`,
      epoch: 'ms',
      db: 'pnetwork-volumes-1',
    }
    const queryStr = querystring.encode(queryObj)

    const res = await get('https://pnetwork.watch/api/datasources/proxy/1/query?' + queryStr)
    
    const { results: [ {series}, sumTvl ] } = res
    const response = {}

    response.tvlTotal = sumTvl.series[0].values[0][1]
    series.forEach(({ tags: { host_blockchain }, values: [ [_, value]]}) => response[chainMapping[host_blockchain]] = value)
    return response
  }
}

const chainMapping = {
  algorand: 'algorand',
  arbitrum: 'arbitrum',
  'binance-smart-chain': 'bsc',
  eosio: 'eos',
  ethereum: 'ethereum',
  libre: 'lbry',
  polygon: 'polygon',
  telos: 'telos',
  ultra: 'ultra',
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'Queries the pNetwork database, using the same API endpoint as their own UI. TVL is based on the amount of assets “locked” in the system and that therefore has a 1:1 tokenisation on a host blockchain, including all of the assets and all of the blockchains supported by pNetwork.'
};

Object.values(chainMapping).forEach(chain => {
  module.exports[chain] = {
    tvl: async (ts) => {
      const response = await getTvl(ts)
      return toUSDTBalances(response[chain] || 0)
    }
  }
})