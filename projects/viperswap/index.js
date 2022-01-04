const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk');
const { toUSDTBalances } = require('../helper/balances');

const graphUrl = 'https://graph.viper.exchange/subgraphs/name/venomprotocol/venomswap-v2'
const graphQuery = gql`
query get_tvl($block: Int) {
  uniswapFactory(
    id: "0x7d02c116b98d0965ba7b642ace0183ad8b8d2196",
    block: { number: $block }
  ) {
    totalLiquidityUSD
  },
}
`;

async function tvl(timestamp) {
  const {block} = await sdk.api.util.lookupBlock(timestamp,{
    chain: 'harmony'
  })
  const response = await request(
    graphUrl,
    graphQuery,
    {
      block,
    }
  );

  const usdTvl = Number(response.uniswapFactory.totalLiquidityUSD)

  return toUSDTBalances(usdTvl)
}

module.exports = {
  harmony:{
    tvl,
  },
  tvl
}
