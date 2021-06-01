// starting block as reference aprox 1050000 in heco chain
const { request, gql } = require("graphql-request");
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");


const REDUCE_BLOCK = 10;

const graphUrls = {
  heco: "https://graph.mdex.com/subgraphs/name/mdex/swap",
  bsc: "https://bsc-graph.mdex.com/subgraphs/name/chains/bsc",
};

const graphQueries = {
  heco: gql`
    query tvl($block: Int) {
      uniswapFactory(
        id: "0xb0b670fc1F7724119963018DB0BfA86aDb22d941"
        block: { number: $block }
      ) {
        totalLiquidityUSD
      }
    }
  `,
  bsc: gql`
    query tvl($block: Int) {
      mdexFactory(
        id: "0x3CD1C46068dAEa5Ebb0d3f55F6915B10648062B8"
        block: { number: $block }
      ) {
        totalLiquidityUSD
      }
    }
  `,
};

// --- We need to token as ref for the balances object ---
const usdtToken = "0xdac17f958d2ee523a2206206994597c13d831ec7";

function getMDEXLiquidity(block, chain) {
  return request(graphUrls[chain], graphQueries[chain], {
    block,
  }).then((data) => data);
}

const hecoTvl = async (timestamp, ethBlock, chainBlocks) => {
  let block = chainBlocks["heco"];

  if (block === undefined) {
    block = (await sdk.api.util.lookupBlock(timestamp, { chain: "heco" }))
      .block;
  }

  // --- Reduce a bit as the indexing takes time to catch up, otherwise error jumps somehow from endpoint ---
  const results = await getMDEXLiquidity(block - REDUCE_BLOCK, "heco");

  return {
    // --- Arrange to account the decimals as it was usdt (decimals = 6) ---
    [usdtToken]: BigNumber(results.uniswapFactory.totalLiquidityUSD)
      .multipliedBy(10 ** 6)
      .toFixed(0),
  };
};

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  let block = chainBlocks["bsc"];

  if (block === undefined) {
    block = (await sdk.api.util.lookupBlock(timestamp, { chain: "bsc" })).block;
  }

  const results = await getMDEXLiquidity(block - REDUCE_BLOCK, "bsc");

  return {
    // --- Arrange to account the decimals as it was usdt (decimals = 6) ---
    [usdtToken]: BigNumber(results.mdexFactory.totalLiquidityUSD)
      .multipliedBy(10 ** 6)
      .toFixed(0),
  };
};

module.exports = {
  heco: {
    tvl: hecoTvl,
  },
  bsc: {
    tvl: bscTvl,
  },
  tvl: sdk.util.sumChainTvls([hecoTvl, bscTvl]),
};
