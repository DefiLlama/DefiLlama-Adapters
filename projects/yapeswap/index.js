const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');

const graphUrl = 'https://api.thegraph.com/subgraphs/name/gavlomas/yapeswap-t2' //changed to yape subgraph
const graphQuery = gql`
query get_tvl($block: Int) {
  yapeswapFactories(
    block: { number: $block }
  ) {
    totalVolumeUSD
    totalLiquidityUSD
  }
}
`;

async function tvl(timestamp, block) {
  const {yapeswapFactories} = await request(
    graphUrl,
    graphQuery,
    {
      block,
    }
  );
  const usdTvl = Number(yapeswapFactories[0].totalLiquidityUSD) // not picking up yapeswap factories

  return toUSDTBalances(usdTvl)
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `Counts the tokens locked on AMM pools, pulling the data from the 'gavlomas/yapeswap-t2' subgraph`,
  ethereum:{
    tvl,
  },
  tvl
}
