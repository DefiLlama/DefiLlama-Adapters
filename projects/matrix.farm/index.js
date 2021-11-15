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
  fetch
}
