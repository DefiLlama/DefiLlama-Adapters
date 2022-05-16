const axios = require("axios");

const BASE_API = "https://vault-api.brahma.fi";
const ENDPOINTS = {
  tvl: "/tvl",
};

const tvl = async (timestamp, block) => {
  const result = await axios.default.get(`${BASE_API}${ENDPOINTS.tvl}`);

  if (result.status !== 200) return {};

  return result.data?.data || {};
};

module.exports = {
  methodology:
    "TVL is the total supply of our vault tokens, multiplied by their corresponding share price. The share price is calculated based on the value of positions taken by vaults both on ethereum and optimism networks",
  ethereum: {
    tvl,
  },
};
