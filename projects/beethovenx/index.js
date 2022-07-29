const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");
const { getBalancerSubgraphTvl } = require("../helper/balancer");

const backendGraphUrlFantom = "https://backend.beets-ftm-node.com/graphql";
const backendGraphUrlOptimism =
  "https://backend-optimism.beets-ftm-node.com/graphql";

const backendGraphQuery = gql`
  query get_tvl {
    data: beetsGetProtocolData {
      totalLiquidity
      block
    }
  }
`;

async function getLatestSyncedBlockFantom() {
  const { data } = await request(backendGraphUrlFantom, backendGraphQuery);
  return data.block;
}

async function getLatestSyncedBlockOptimism() {
  const { data } = await request(backendGraphUrlOptimism, backendGraphQuery);
  return data.block;
}

async function fantom(timestamp, ...params) {
  if (Math.abs(timestamp - Date.now() / 1000) < 3600 / 2) {
    const { data } = await request(backendGraphUrlFantom, backendGraphQuery);
    return toUSDTBalances(data.totalLiquidity);
  }
  return getBalancerSubgraphTvl(
    "https://api.thegraph.com/subgraphs/name/beethovenxfi/beethovenx",
    "fantom"
  )(timestamp, ...params);
}

async function optimism(timestamp, ...params) {
  if (Math.abs(timestamp - Date.now() / 1000) < 3600 / 2) {
    const { data } = await request(backendGraphUrlOptimism, backendGraphQuery);
    return toUSDTBalances(data.totalLiquidity);
  }
  return getBalancerSubgraphTvl(
    "https://api.thegraph.com/subgraphs/name/beethovenxfi/beethovenx-optimism",
    "optimism"
  )(timestamp, ...params);
}

module.exports = {
  methodology: `BeethovenX TVL is pulled from the Balancer subgraph and includes deposits made to v2 liquidity pools.`,
  fantom: {
    tvl: fantom,
  },
  optimism: {
    tvl: optimism,
  },
};
