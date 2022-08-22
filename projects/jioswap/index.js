const { sumTokens2 } = require("../helper/unwrapLPs");
const config = require("./config");
const { getFixBalances } = require("../helper/portedTokens");
const ethers = require("ethers")
const { config: configRPC } = require('@defillama/sdk/build/api');

configRPC.setProvider("godwoken_v1", new ethers.providers.StaticJsonRpcProvider(
  "https://v1.mainnet.godwoken.io/rpc",
  {
    name: "godwoken_v1",
    chainId: 71402,
  }
))

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Counts as TVL all the Assets deposited on each chain through different Pool Contracts",
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) => {
      const toa = [];
      const blacklistedTokens = [];
      Object.values(config[chain]).forEach(
        ({ address, lpToken, poolTokens }) => {
          blacklistedTokens.push(lpToken);
          poolTokens.forEach((i) => toa.push([i.address, address]));
        }
      );
      const balances = await sumTokens2({
        tokensAndOwners: toa,
        chain,
        block,
        blacklistedTokens,
      });
      const fixBalances = await getFixBalances(chain);
      fixBalances(balances);
      return balances;
    },
  };
});
