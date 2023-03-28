const axios = require("axios");

const CHAIN = {
  1: "ethereum",
  56: "binance",
  137: "polygon",
  250: "fantom",
};

const getFee = async (chainId) => {
  const { data } = await axios.get("https://api.plexus.app/v1/dashboard/fee");
  return data.data[chainId];
};

module.exports = Object.entries(CHAIN).reduce(
  (result, [chainId, chainName]) => {
    result[chainName] = { fetch: () => getFee(chainId) };
    return result;
  },
  {}
);
