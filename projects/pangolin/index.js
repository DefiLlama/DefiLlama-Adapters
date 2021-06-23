const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk');
const { toUSDTBalances } = require('../helper/balances');
const graphUrl = 'https://api.thegraph.com/subgraphs/name/dasconnor/pangolin-dex'

const graphQuery = gql`
query get_tvl($block: Int) {
  pangolinFactory(
    id: "0xefa94DE7a4656D787667C749f7E1223D71E9FD88",
    block: { number: $block }
  ) {
        totalLiquidityETH
        totalLiquidityUSD
  },
  tokens(where: { id: "0xde3a24028580884448a5397872046a019649b084" }) {
    derivedETH
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

  return {
    'avalanche-2': Number(response.pangolinFactory.totalLiquidityETH)
  }
}

module.exports = {
  avalanche:{
    tvl,
  },
  start: 1612715300, // 7th-Feb-2021
  tvl
}