const { toUSDTBalances } = require('./helper/balances');
const axios = require('axios')

const data = {}

const HOURS_12 = 12 * 60 * 60 * 1000

function getTvl(timestamp) {
  const tsStr = '' + timestamp
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

    const { data: res } = await axios.get('https://pnetwork.watch/api/datasources/proxy/1/query', { params: queryObj })

    const { results: [{ series }, sumTvl] } = res
    const response = {}

    response.tvlTotal = getTvl(sumTvl.series[0].values)
    series.forEach(({ tags: { host_blockchain }, values }) => response[chainMapping[host_blockchain]] = getTvl(values))
    if (!response.tvlTotal) throw new Error('Incorrect tvl')

    return response
  }

  function getTvl(values) {
    return values.reduce((a, i) => a ? a : i[1], 0)
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