const config = require("./config");
const { sumTokens2 } = require("../helper/unwrapLPs");

Object.keys(config).forEach((chain) => {
  const arg = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const pools = Object.values(arg["pools"]);

      let allUnderlying = await api.multiCall({ abi: "address[]:getTokens", calls: pools, });

      const tokens = [];
      const calls = [];
      pools.forEach((v, i) => {
        allUnderlying[i].forEach((t) => {
          tokens.push(t);
          calls.push({ target: v, params: t });
        });
      });
      const wTokens = await api.multiCall({ abi: "function addressOfAsset(address) view returns (address)", calls, });
      return sumTokens2({ api, tokensAndOwners2: [tokens, wTokens], });
    },
  };
});
