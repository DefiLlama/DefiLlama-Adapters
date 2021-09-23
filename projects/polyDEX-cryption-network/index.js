const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');

const graphUrl = 'https://api.thegraph.com/subgraphs/name/gulshancryption/cntexchange'
const graphQuery = gql`
query get_tvl($block: Int) {
    factories(
    block: { number: $block }
  ) {
    volumeUSD
    liquidityUSD
  }
}
`;

async function tvl(timestamp, block, chainBlocks) {
  const {factories} = await request(
    graphUrl,
    graphQuery,
    {
      block: chainBlocks['polygon'] - 60,
    }
  );
  const usdTvl = Number(factories[0].liquidityUSD)

  return toUSDTBalances(usdTvl)
}

module.exports = {
  misrepresentedTokens: true,
  polygon:{
    tvl,
  },
  tvl
}