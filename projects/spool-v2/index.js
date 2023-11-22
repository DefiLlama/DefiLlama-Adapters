const sdk = require("@defillama/sdk");
const { sumTokens2 } = require("../helper/unwrapLPs.js");
const abi = require("./abi.json");
const { request, gql } = require("graphql-request");
const { staking } = require("../helper/staking.js");

const config = {
  ethereum: {
    subgraphUrl:
      "https://api.studio.thegraph.com/query/41372/spool-v2_mainnet/version/latest",
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

const SPOOL = "0x40803cea2b2a32bda1be61d3604af6a814e70976";
const SPOOL_staking = "0xc3160C5cc63B6116DD182faA8393d3AD9313e213";
module.exports.ethereum.staking = staking(SPOOL_staking, SPOOL);
