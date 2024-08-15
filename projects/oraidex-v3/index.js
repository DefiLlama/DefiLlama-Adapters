const graphql = require('../helper/utils/graphql');
const ADDRESSES = require('../helper/coreAssets.json')

async function tvl() {
  try {
    const endpoint = 'https://staging-ammv3-indexer.oraidex.io'
    const query = `query poolQuery {
        pools {
          nodes {
              id
              totalValueLockedInUSD
          }
        }
      }`
    const res = await graphql.request(endpoint, query)

    const token = 'orai:' + ADDRESSES.orai.USDT
    const sum = {
      [token]: 0
    }
    const COSMOS_DECIMALS = 6;
    const decimals = 10 ** COSMOS_DECIMALS;
    res.pools.nodes.forEach(pool => {
      sum[token] += pool.totalValueLockedInUSD * decimals
    })
    return sum
  } catch (error) {
    console.error("Error when get tvl oraidex v3: ", error)
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Liquidity on pool V3",
  orai: {tvl}
}