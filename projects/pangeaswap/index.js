const retry = require('async-retry')
const axios = require('axios')
const { toUSDTBalances } = require('../helper/balances');

async function fetchTVL() {
  const endpoint = 'https://api.pangeaswap.com/graphql';
  const headers = { 'content-type': 'application/json' };
  const graphqlQuery = {
    operationName: 'fetchTVL',
    query: `query fetchTVL { summation { totalValueLocked } }`,
    variables: {},
  };

  const response = await retry(
    async () => axios({
      url: endpoint,
      method: 'post',
      headers: headers,
      data: graphqlQuery,
    })
  );

  let totalValueLocked = response.data.data.summation.totalValueLocked;
  return toUSDTBalances(totalValueLocked.toFixed(2));
}

module.exports = {
  methodology: `Tvl counts the tokens locked on AMM pools. Data is pulled from the 'https://api.pangeaswap.com/graphql'`,
  klaytn: {
    tvl: fetchLiquidity,
  },
  misrepresentedTokens: true,
  timetravel: false,
}
