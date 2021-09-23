const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk');
const { toUSDTBalances } = require('../helper/balances');

const graphUrl = 'https://api.thegraph.com/subgraphs/name/venomprotocol/cobra-exchange'
const graphQuery = gql`
query get_tvl($block: Int) {
  uniswapFactories(
    block: { number: $block }
  ) {
  		totalLiquidityUSD
  }
}
`;

async function tvl(timestamp, ethBlock, chainBlocks) {
  const response = await request(
    graphUrl,
    graphQuery,
    {
      block: chainBlocks.bsc,
    }
  );

  const usdTvl = Number(response.uniswapFactories[0].totalLiquidityUSD)

  return toUSDTBalances(usdTvl)
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `Includes all locked liquidity in AMM pools, pulling the data from TheGraph hosted 'venomprotocol/cobra-exchange' subgraph`,
  bsc:{
    tvl,
  },
  tvl
}
