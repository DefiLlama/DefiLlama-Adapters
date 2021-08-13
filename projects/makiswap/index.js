const { request, gql } = require("graphql-request");
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

const abi = require("./abi.json");

// We use USDT for TVL for all farm pairs
const usdtToken = "0xdac17f958d2ee523a2206206994597c13d831ec7";

const tvl = async (timestamp, ethBlock, chainBlocks) => {
  let block = chainBlocks["heco"];

  if (block === undefined) {
    block = (await sdk.api.util.lookupBlock(timestamp, { chain: "heco" }))
      .block;
  }

  const gqlEndpoint = 'https://q.hg.network/subgraphs/name/maki-exchanges/heco';
  const gqlQuery = `
    query tvl($block: Int){
      uniswapFactories (
        block:{ number: $block }
      ) {
        totalLiquidityUSD
      }
    }
  `;
  const result = await request(gqlEndpoint, gqlQuery, { block })
    .then((data) => data.uniswapFactories[0].totalLiquidityUSD);

  return {
    // --- Arrange to account the decimals as it was usdt (decimals = 6) ---
    [usdtToken]: BigNumber(result)
      .multipliedBy(10 ** 6)
      .toFixed(0),
  };
};

module.exports = {
  misrepresentedTokens: true,
  tvl
};
