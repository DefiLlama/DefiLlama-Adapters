const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");

async function fetch() {

        const res = retry(async bail =>  await axios.post("https://api.thegraph.com/subgraphs/name/hurricaneswap/exchange", {
          query: `{
            pancakeFactories(first: 5) {
              id
              totalLiquidityUSD
            }
          }`,
          variables: null
        }));

    const tvl = res?.data?.data?.pancakeFactories[0]['totalLiquidityUSD']

  return tvl;
}

module.exports = {
  fetch
}