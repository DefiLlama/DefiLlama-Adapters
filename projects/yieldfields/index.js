const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');
const graphUrl = 'https://api.thegraph.com/subgraphs/name/sotblad/yieldfieldsexchange'

const graphQuery = gql`
query get_tvl($block: Int) {
  yieldfieldsFactory(
    id: "0x0A376eE063184B444ff66a9a22AD91525285FE1C",
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
      block:chainBlocks.bsc,
    }
  );

  return toUSDTBalances(Number(response.yieldfieldsFactory.totalLiquidityUSD));
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'The YieldFields subgraph and the YieldFields factory contract address are used to obtain the balance held in every LP pair.',
  binance:{
    tvl,
  },
  start: 1621263282, // May-17-2021 03:54:42 PM
  tvl
}