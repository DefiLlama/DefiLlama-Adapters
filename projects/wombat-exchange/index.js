const config = require("./config");
const { staking } = require("../helper/staking");
const { sumTokens2 } = require("../helper/unwrapLPs");

Object.keys(config).forEach((chain) => {
  let { pools, wom, veWom } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      pools = Object.values(pools);

      let allUnderlying = await api.multiCall({
        abi: "address[]:getTokens",
        calls: pools,
      });

      const tokens = [];
      const calls = [];
      pools.forEach((v, i) => {
        allUnderlying[i].forEach((t) => {
          tokens.push(t);
          calls.push({ target: v, params: t });
        });
      });
      const wTokens = await api.multiCall({
        abi: "function addressOfAsset(address) view returns (address)",
        calls,
      });
      return sumTokens2({ api, tokensAndOwners2: [tokens, wTokens] });
    },
    staking: wom && veWom ? staking(veWom, wom) : undefined,
  };
});

module.exports["hallmarks"] = config["hallmarks"];
