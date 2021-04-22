const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk');
const { toUSDTBalances } = require('../helper/balances');

const graphUrl = 'https://api.thegraph.com/subgraphs/name/yetiswap/yetiswap'
const graphQuery = gql`
query get_tvl($block: Int) {
  pangolinFactory(
    id: "0x58C8CD291Fa36130119E6dEb9E520fbb6AcA1c3a",
    block: { number: $block }
  ) {
        totalLiquidityETH
        totalLiquidityUSD
  },
  tokens(where: { symbol: "USDT" }, first:1) {
    derivedETH
  }
}
`;

async function tvl(timestamp, ethereumBlock, chainBlocks) {
  const block = chainBlocks['avax']
  const response = await request(
    graphUrl,
    graphQuery,
    {
      block,
    }
  );

  const usdTvl = Number(response.pangolinFactory.totalLiquidityETH) / Number(response.tokens[0].derivedETH)
  return toUSDTBalances(usdTvl)
}

module.exports = {
  avalanche:{
    tvl,
  },
  tvl
}