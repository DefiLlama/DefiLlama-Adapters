const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk');
const { toUSDTBalances } = require('../helper/balances');

const graphUrl = 'https://zero-graph.0.exchange/subgraphs/name/zeroexchange/zerograph'
const graphQuery = gql`
query get_tvl($block: Int) {
  zeroFactory(
    id: "0x2Ef422F30cdb7c5F1f7267AB5CF567A88974b308",
    block: { number: $block }
  ) {
    totalLiquidityUSD
  },
  tokens(where: { symbol: "USDT" }, first:1) {
    derivedETH
  }
}
`;

async function tvl(timestamp) {
  const {block} = await sdk.api.util.lookupBlock(timestamp,{
    chain: 'avax'
  })
  const response = await request(
    graphUrl,
    graphQuery,
    {
      block,
    }
  );

  const usdTvl = Number(response.zeroFactory.totalLiquidityUSD)

  return toUSDTBalances(usdTvl)
}

module.exports = {
  avalanche:{
    tvl,
  },
  tvl
}