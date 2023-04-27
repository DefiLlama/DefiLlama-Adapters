const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");
const { blockQuery } = require("./http");

function getChainTvl(
  graphUrls,
  factoriesName = "factories",
  tvlName = "totalValueLockedUSD",
  blockCatchupLimit = 500
) {
  const graphQuery = gql`
    query get_tvl($block: Int!) {
      ${factoriesName}(
        block: { number: $block }
      ) {
        ${tvlName}
      }
    }
  `;

  const blockGraphQuery = gql`
    query get_block {
      blocks(orderBy: "number", first: 1, orderDirection: "desc") {
        number
      }
    }
  `;

  return (chain) => {
    return async (_, _b, _cb, { api }) => {
      api.getBlock = async function () {
        try {
          const blocks = (
            await request(
              "https://graph.hydradex.org/subgraphs/name/blocklytics/ethereum-blocks",
              blockGraphQuery
            )
          ).blocks;

          this.block = Number(blocks[0].number) || undefined;
        } catch {
          this.block = undefined;
        }
      };
      await api.getBlock();
      const block = api.block;

      let uniswapFactories;

      if (!blockCatchupLimit) {
        uniswapFactories = (
          await request(graphUrls[chain], graphQuery, { block })
        )[factoriesName];
      } else {
        uniswapFactories = (
          await blockQuery(graphUrls[chain], graphQuery, {
            api,
            blockCatchupLimit,
          })
        )[factoriesName];
      }

      const usdTvl = Number(uniswapFactories[0][tvlName]);
      return toUSDTBalances(usdTvl);
    };
  };
}

module.exports = {
  getChainTvl,
};
