const retry = require('async-retry')
const axios = require("axios");
const { GraphQLClient, gql } = require('graphql-request')
const utils = require('./helper/utils');


async function fetch(latestBlock = null) {
  let endpoint ='https://api.thegraph.com/subgraphs/name/bacon-labs/eighty-eight-mph';
  let graphQLClient = new GraphQLClient(endpoint)

  let price_feed = await utils.getPricesfromString('uniswap');

  var query = gql`
  {
    dpools {
      totalActiveDeposit
      stablecoin
    }
  }
  `;
  let tvl = 0;
  const results = await retry(async bail => await graphQLClient.request(query))
  results.dpools.map(pool => {
    if (pool.stablecoin === '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984') {
      tvl += (parseFloat(pool.totalActiveDeposit) * price_feed.data.uniswap.usd)
    } else {
      tvl += parseFloat(pool.totalActiveDeposit)
    }
  })
  return tvl;
}

module.exports = {
  fetch
}
