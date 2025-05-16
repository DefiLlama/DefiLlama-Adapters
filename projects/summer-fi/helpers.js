const { cachedCalls } = require("./cache");

const getDecimalsData = async (tokens, api) => {
  return cachedCalls({
    items: tokens,
    multiCall: async (calls) =>
      api.multiCall({
        abi: "erc20:decimals",
        calls,
      }),
    key: "getDecimalsData",
  });
};

module.exports = {
  getDecimalsData,
};
