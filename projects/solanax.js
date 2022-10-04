const retry = require("./helper/retry");
const axios = require("axios");
const { toUSDTBalances } = require('./helper/balances');;

async function fetch() {
  const response = (
    await retry(
      async (bail) => await axios.get("https://solanax.org/api/data/")
    )
  ).data;

  const tvl = response.total_locked;

  return toUSDTBalances(tvl);
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `TVL is fetched by making calls to the Solanax API (https://solanax.org/api/data/)`,
  solana: {
      tvl: fetch,
  }
  
};