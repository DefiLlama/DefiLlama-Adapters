const sdk = require("@defillama/sdk");
const { sumTokens2 } = require("../helper/unwrapLPs.js");
const { staking } = require("../helper/staking.js");
const abi = require("./abi.json");
const { request, gql } = require("graphql-request");

const config = {
  ethereum: {
    subgraphUrl: "test_url",
  },
};

module.exports = {
  methodology: `Counting assets deployed to each strategy`,
};

const allStrategiesQuery = gql`
  query MyQuery {
    strategies(where: { isRemoved: false, isGhost: false }) {
      id
      isRemoved
      assetGroup {
        assetGroupTokens {
          token {
            id
          }
        }
      }
    }
  }
`;

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api }) => {
      const strategiesObject = await request(
        config[chain].subgraphUrl,
        allStrategiesQuery
      );
      const strategies = Object.values(strategiesObject.strategies).map(
        (item) => item.id
      );

      let tokenAddresses = Object.values(strategiesObject.strategies).map(
        (item) =>
          item.assetGroup.assetGroupTokens.map((token) => token.token.id)
      );

      let strategiesAssetAmounts = await api.multiCall({
        abi: abi.strategyUnderlyingAmountAbi,
        calls: strategies,
      });

      tokenAddresses = tokenAddresses.flatMap((subArray) => subArray);
      strategiesAssetAmounts = strategiesAssetAmounts.flatMap(
        (subArray) => subArray
      );

      const balances = {};
      strategiesAssetAmounts.forEach((strategyAssetAmount, i) => {
        sdk.util.sumSingleBalance(
          balances,
          tokenAddresses[i],
          strategyAssetAmount,
          api.chain
        );
      });

      const res = await sumTokens2({
        api,
        balances,
        tokens: tokenAddresses,
      });

      return res;
    },
  };
});
