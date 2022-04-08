const BigNumber = require("bignumber.js");
const { toUSDTBalances } = require("../helper/balances");
const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");

const tokenSubgraphUrl =
  "https://api.thegraph.com/subgraphs/name/bunicorndefi/buni-token";
const stableSubgraphUrl =
  "https://api.thegraph.com/subgraphs/name/bunicorndefi/buni-stablecoins";
const BUNI_CONTRACT_ADDRESS = "0x0e7beec376099429b85639eb3abe7cf22694ed49";
const MASTERCHEF_CONTRACT_ADDRESS =
  "0xA12c974fE40ea825E66615bA0Dc4Fd19be4D7d24";

const graphTotalTokenTVLQuery = gql`
  query GET_TOTAL_TOKEN_TVL($block: Int) {
    bunis(where: { id: 1 }, block: { number: $block }) {
      totalLiquidity
    }
  }
`;

const graphTotalStableTVLQuery = gql`
  query GET_TOTAL_STABLE_TVL($block: Int) {
    buniCornFactories(
      where: { id: "0x86873f85bc12ce40321340392c0ff39c3bdb8d68" }
      block: { number: $block }
    ) {
      id
      totalLiquidityUSD
    }
  }
`;

async function getTotalFarmTVL(timestamp, ethBlock, chainBlocks) {
  try {
    const balances = {};
    const stakedBuni = sdk.api.erc20.balanceOf({
      target: BUNI_CONTRACT_ADDRESS,
      owner: MASTERCHEF_CONTRACT_ADDRESS,
      chain: "bsc",
      block: chainBlocks.bsc,
    });
    sdk.util.sumSingleBalance(
      balances,
      "bsc:" + BUNI_CONTRACT_ADDRESS,
      (await stakedBuni).output
    );
    return balances;
  } catch (e) {
    throw new Error("getTotalFarmTVL has exception:" + e.message);
  }
}

async function getTotalTokenTVL(timestamp, ethBlock, chainBlocks) {
  try {
    const { bunis } = await request(tokenSubgraphUrl, graphTotalTokenTVLQuery, {
      block: chainBlocks.bsc,
    });

    return (bunis[0] && bunis[0].totalLiquidity) || 0;
  } catch (e) {
    throw new Error("getTotalTokenTVL has exception:" + e.message);
  }
}

async function getTotalStableTVL(timestamp, ethBlock, chainBlocks) {
  try {
    const { buniCornFactories } = await request(
      stableSubgraphUrl,
      graphTotalStableTVLQuery,
      {
        block: chainBlocks.bsc,
      }
    );

    return (
      (buniCornFactories[0] && buniCornFactories[0].totalLiquidityUSD) || 0
    );
  } catch (e) {
    throw new Error("getTotalStableTVL has exception:" + e.message);
  }
}

async function getTotalTVL(timestamp, ethBlock, chainBlocks) {
  const [tokensSummary, stableSummary] = await Promise.all([
    getTotalTokenTVL(timestamp, ethBlock, chainBlocks),
    getTotalStableTVL(timestamp, ethBlock, chainBlocks),
  ]);

  return toUSDTBalances(new BigNumber(tokensSummary).plus(stableSummary));
}

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getTotalTVL,
    staking: getTotalFarmTVL,
  },
};
