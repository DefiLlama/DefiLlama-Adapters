const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');
const graphUrl = 'https://api.thegraph.com/subgraphs/name/dasconnor/pangolin-dex'

const graphQuery = gql`
query get_tvl($block: Int) {
  pangolinFactory(
    id: "0xefa94DE7a4656D787667C749f7E1223D71E9FD88",
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
      block:chainBlocks.avax,
    }
  );

  return toUSDTBalances(Number(response.pangolinFactory.totalLiquidityUSD));
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'The Pangolin subgraph and the Pangolin factory contract address are used to obtain the balance held in every LP pair.',
  avalanche:{
    tvl,
  },
  start: 1612715300, // 7th-Feb-2021
}