const axios = require("axios");
const MATRIX_API = "https://api.matrix.farm/";

const client = axios.create({
  baseURL: MATRIX_API
});

async function fetch() {
  const tvlRes = await client.get("/statistics/tvl");
  const fantom = tvlRes.data.fantom
  const optimism = tvlRes.data.optimism

  return {fantom, optimism};
}

module.exports = {
  doublecounted: true,
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "The TVL is calculated using a google cloud function that runs every minute, it checks the value of all the LPs staked in our vaults and returns the total",
  ...fetch()
}