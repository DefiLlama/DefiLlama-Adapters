const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');

const graphUrl = 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-alt'
const graphQuery = gql`
query get_tvl($block: Int) {
  factories(
    block: { number: $block }
  ) {
    totalVolumeUSD
    totalValueLockedUSD
  }
}
`;

async function tvl(timestamp, block) {
  const {factories} = await request(
    graphUrl,
    graphQuery,
    {
      block,
    }
  );
  const usdTvl = Number(factories[0].totalValueLockedUSD)

  return toUSDTBalances(usdTvl)
}

module.exports = {
  ethereum:{
    tvl,
  },
  tvl
}