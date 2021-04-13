const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk')
const graphUrl = 'https://api.thegraph.com/subgraphs/name/olive-rose/olivecash'

const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const graphQuery = gql`
query get_tvl($block: Int) {
  pangolinFactory(
    id: "0x4Fe4D8b01A56706Bc6CaD26E8C59D0C7169976b3",
    block: { number: $block }
  ) {
        totalLiquidityETH
  },
  tokens(where: { symbol: "USDT" }, first:1) {
    derivedETH
  }
}
`;
// Response should be the following:
// {
//   "data": {
//   "tokens": [
//     {
//       "derivedETH": "0.03153220767265978413381371295488958"
//     }
//   ],
//       "pangolinFactory": {
//     "totalLiquidityETH": "132833.6232868980185536992835742923"
//   }
// }
// }
//  132833/ 0.031 = ~4.2M TVL - its correct now

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

  const usdTvl = Number(response.pangolinFactory.totalLiquidityETH) / Number(response.tokens[0].derivedETH)

  return {
    [usdtAddress]: (usdTvl * 1e6).toFixed(0)
  }
}

module.exports = {
  avalanche:{
    tvl,
  },
  tvl
}