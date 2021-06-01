// starting block as reference aprox 1050000 in heco chain
const { request, gql } = require("graphql-request");
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

const endpoint = "https://graph.mdex.com/subgraphs/name/mdex/swap";

const graphQuery = gql`
  query tvl($block: Int) {
    uniswapFactory(
      id: "0xb0b670fc1F7724119963018DB0BfA86aDb22d941"
      block: { number: $block }
    ) {
      totalLiquidityUSD
    }
  }
`;

// --- We need to token as ref for the balances object ---
const usdtToken = "0xdac17f958d2ee523a2206206994597c13d831ec7";

function getMDEXLiquidity(block) {
  return request(endpoint, graphQuery, {
    block,
  }).then((data) => data.uniswapFactory.totalLiquidityUSD);
}

const hecoTvl = async (timestamp, ethBlock, chainBlocks) => {
  let block = chainBlocks["heco"];

  if (block === undefined) {
    block = (await sdk.api.util.lookupBlock(timestamp, { chain: "heco" }))
      .block;
  }

  // --- Reduce a bit as the indexing takes time to catch up, otherwise error jumps somehow from endpoint ---
  const results = await getMDEXLiquidity(block - 500);

  return {
    // --- Arrange to account the decimals as it was usdt (decimals = 6) ---
    [usdtToken]: BigNumber(results)
      .multipliedBy(10 ** 6)
      .toFixed(0),
  };
};

module.exports = {
  heco: {
    tvl: hecoTvl,
  },
  tvl: hecoTvl,
};
