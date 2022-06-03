const { GraphQLClient, gql } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");
const { getBlock } = require("../helper/getBlock");
async function getTVL(subgraphName, block) {
  // delayed by 500 blocks to allow subgraph to update
  block -= 500;
  var endpoint = `https://api.thegraph.com/subgraphs/name/beethovenxfi/${subgraphName}`;
  var graphQLClient = new GraphQLClient(endpoint);

  var query = gql`
    query get_tvl($block: Int) {
      balancers(first: 5, block: { number: $block }) {
        totalLiquidity
        totalSwapVolume
      }
    }
  `;
  const results = await graphQLClient.request(query, {
    block,
  });
  return results.balancers[0].totalLiquidity;
}

async function fantom(timestamp, ethBlock, chainBlocks) {
  return toUSDTBalances(
    await getTVL("beethovenx", await getBlock(timestamp, "fantom", chainBlocks))
  );
}

async function optimism(timestamp, ethBlock, chainBlocks) {
  return toUSDTBalances(
    await getTVL(
      "beethovenx-optimism",
      await getBlock(timestamp, "optimism", chainBlocks)
    )
  );
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology: `BeethovenX TVL is pulled from the Balancer subgraph and includes deposits made to v2 liquidity pools.`,
  fantom: {
    tvl: fantom,
  },
  optimism: {
    tvl: optimism,
  },
};
