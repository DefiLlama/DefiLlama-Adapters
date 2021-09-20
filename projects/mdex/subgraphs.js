const { request, gql } = require("graphql-request");
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const { calculateUniTvl } = require('../helper/calculateUniTvl')
const {toUSDTBalances} = require('../helper/balances')

// --> bsc addresses found here:    https://github.com/mdexSwap/bscswap
// --> heco addresses found here:   https://github.com/mdexSwap/contracts

const factories = {
  heco: "0xb0b670fc1F7724119963018DB0BfA86aDb22d941",
  bsc: "0x3CD1C46068dAEa5Ebb0d3f55F6915B10648062B8",
};

const REDUCE_BLOCK = 60;

const graphUrls = {
  heco: "https://heco-lite-graph.mdex.cc/subgraphs/name/chain/heco",
  bsc: "https://bsc-lite-graph.mdex.one/subgraphs/name/chain/bsc",
};

const graphQueries = {
  heco: gql`
    query tvl($block: Int) {
      mdexFactory(
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
  });
}

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const chain = "bsc"
  const results = await request(graphUrls[chain], graphQueries[chain], {
    block: chainBlocks.bsc,
  });
  return toUSDTBalances(results.mdexFactory.totalLiquidityUSD)
};

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
    [usdtToken]: BigNumber(results.mdexFactory.totalLiquidityUSD)
      .multipliedBy(10 ** 6)
      .toFixed(0),
  };
};

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: bscTvl, //   individually outputs >1B    ---   breakdown per token             (OK)
  },
  heco: {
    tvl: hecoTvl, //  individually outputs >1B    ---   simply using graphql endpoint   (OK)
  },
  tvl: sdk.util.sumChainTvls([hecoTvl, bscTvl]),
};
