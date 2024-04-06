const { getConfig } = require('../helper/cache');
const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require("../helper/unwrapLPs");

const chains = {
  ethereum: 1,
  //   optimism: 10,
  base: 8453,
  pgn: 424,
};
let output = {};

Object.keys(chains).map((chain) => {
  output[chain] = {
    tvl: async (api) => {
      let res = await getConfig('optmism-bridge', "https://static.optimism.io/optimism.tokenlist.json");
      const tokenData = res.tokens.filter(
        (t) => t.chainId == chains[chain]
      );

      const tokens = [
        ADDRESSES.null,
        ...tokenData.map((t) => t.address),
      ];
      const owners = [
        ...new Set(tokenData.map((t) => t.extensions.optimismBridgeAddress)),
      ].filter((o) => o);

      if (chain == "ethereum")
        owners.push("0xbEb5Fc579115071764c7423A4f12eDde41f106Ed");
      return sumTokens2({
        api,
        tokens,
        owners,
        fetchCoValentTokens: true,
      });
    },
  };
});

module.exports = output;
// node test.js projects/optimisim/index.js
