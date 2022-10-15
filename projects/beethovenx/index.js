const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");
const { getBalancerSubgraphTvl } = require("../helper/balancer");

const backendGraphUrlFantom = "https://backend-v2.beets-ftm-node.com/graphql";
const backendGraphUrlOptimism =
  "https://backend-optimism-v2.beets-ftm-node.com/graphql";

const backendTvlGraphQuery = gql`
  query get_tvl {
    data: protocolMetrics {
      totalLiquidity
    }
  }`;

const backendLatestBlockQuery = gql`
query get_latest_block {
  data: latestSyncedBlocks {
    poolSyncBlock
  }
}`;

async function getLatestSyncedBlockFantom() {
  const { data } = await request(backendGraphUrlFantom, backendLatestBlockQuery);
  return data.poolSyncBlock;
}

async function getLatestSyncedBlockOptimism() {
  const { data } = await request(backendGraphUrlOptimism, backendLatestBlockQuery);
  return data.poolSyncBlock;
}

async function fantom(timestamp, ...params) {
  if (Math.abs(timestamp - Date.now() / 1000) < 3600 / 2) {
    const { data } = await request(backendGraphUrlFantom, backendTvlGraphQuery);
    return toUSDTBalances(data.totalLiquidity);
  }
  return getBalancerSubgraphTvl(
    "https://api.thegraph.com/subgraphs/name/beethovenxfi/beethovenx",
    "fantom"
  )(timestamp, ...params);
}

async function optimism(timestamp, ...params) {
  if (Math.abs(timestamp - Date.now() / 1000) < 3600 / 2) {
    const { data } = await request(backendGraphUrlOptimism, backendTvlGraphQuery);
    return toUSDTBalances(data.totalLiquidity);
  }
  return getBalancerSubgraphTvl(
    "https://api.thegraph.com/subgraphs/name/beethovenxfi/beethovenx-optimism",
    "optimism"
  )(timestamp, ...params);
}

module.exports = {
  methodology: `BeethovenX TVL is pulled from the Balancer subgraph and on-chain. It includes deposits made to v2 liquidity pools.`,
  fantom: {
    tvl: fantom,
  },
  optimism: {
    tvl: optimism,
  },
};
