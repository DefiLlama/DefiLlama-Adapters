const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk');
const { toUSDTBalances } = require('../helper/balances');

const graphUrl = 'https://api.thegraph.com/subgraphs/name/levinswap/uniswap-v2'
const graphQuery = gql`
query get_tvl($block: Int) {
  uniswapFactory(
    id: "0x965769C9CeA8A7667246058504dcdcDb1E2975A5",
    block: { number: $block }
  ) {
    totalVolumeUSD
    totalLiquidityUSD
  }
}
`;

async function tvl(timestamp) {
  const { block } = await sdk.api.util.lookupBlock(timestamp, {
    chain: 'xdai'
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

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  misrepresentedTokens: true,
  xdai: {
    tvl
  },
  name: "Levinswap", // Project name
  token: 'LEVIN', // LEVIN governance token
  category: "dexes", // AMM DEX on xDai
  start: 14000780, // Start block January-13-2021 03:01:30 AM +4 UTC
  tvl
};
