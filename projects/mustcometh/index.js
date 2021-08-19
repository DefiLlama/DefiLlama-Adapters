const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk');
const { toUSDTBalances } = require('../helper/balances');

const graphUrl = 'https://api.thegraph.com/subgraphs/name/kelvyne/comethswap'
const graphQuery = gql`
query get_tvl($block: Int) {
  uniswapFactory(
    id: "0x800b052609c355cA8103E06F022aA30647eAd60a",
    block: { number: $block }
  ) {
    totalVolumeUSD
    totalLiquidityUSD
  }
}
`;

async function tvl(timestamp) {
  const { block } = await sdk.api.util.lookupBlock(timestamp, {
    chain: 'polygon'
  })
  const {uniswapFactory} = await request(
    graphUrl,
    graphQuery,
    {
      block,
    }
  );
  const usdTvl = Number(uniswapFactory.totalLiquidityUSD)

  return toUSDTBalances(usdTvl)
}

module.exports = {
  misrepresentedTokens: true,
  name: 'MustCometh',
  token: 'MUST',
  category: 'Dexes',
  matic: tvl,
  start: 0, // WRONG!
  tvl
}