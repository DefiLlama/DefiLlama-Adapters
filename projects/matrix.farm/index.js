const axios = require("axios");
const MATRIX_API = "https://api.matrix.farm/";

const client = axios.create({
  baseURL: MATRIX_API
});

async function fetch() {
  const tvlRes = await client.get("/statistics/tvl");
  const tvl = tvlRes.data.tvl;
  return tvl;
}

module.exports = {
  methodology: "The TVL is calculated using a google cloud function that runs every 30 minutes, it checks the value of all the LPs staked in our vaults and returns the total",
  fetch
}
