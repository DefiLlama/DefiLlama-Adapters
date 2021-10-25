const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');

const graphUrl = 'https://api.thegraph.com/subgraphs/name/arrenv/behodler'
const graphQuery = gql`
query get_tvl($block: Int) {
  behodlers(
    block: { number: $block }
  ) {
    id
    usdVolume
    usdLiquidity
  }
}
`;

async function tvl(timestamp, block) {
  const {behodlers} = await request(
    graphUrl,
    graphQuery,
    {
      block,
    }
  );
  const usdTvl = Number(behodlers[0].usdLiquidity)

  return toUSDTBalances(usdTvl)
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `ERC20 tokens deposited as liquidity on the AMM. You can see this on https://analytics.behodler.io/#/, pulling the data from the 'arrenv/behodler' subgraph. Behodler also utilizes a universal liquidity token called Scarcity ($SCX).`,
  ethereum:{
    tvl,
  },
  tvl
}