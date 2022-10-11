const retry = require('../helper/retry');
const axios = require('axios');
const { parse } = require('dotenv');

async function fetch() {
  const response = (
    await retry(
      async (bail) => await axios.get('https://nest-api.goosefx.io/tvl')
    )
  ).data;
  console.log(response);
  return response;
}

fetch();

module.exports = {
  timetravel: false,
  methodology: "TVL = Total GOFX Staked + Total Value of Deposits into Single-Sided Liquidity Pools",
  fetch,
};
