const { request, gql } = require("graphql-request");
const graphUrl = 'https://api.thegraph.com/subgraphs/name/olive-rose/olivecash'

const graphQuery = gql`
query get_tvl($block: Int) {
  uniswapFactory(
    id: "0x4Fe4D8b01A56706Bc6CaD26E8C59D0C7169976b3",
    block: { number: $block }
  ) {
    totalVolumeUSD
    totalLiquidityUSD
  }
}
`;
const usdtAddress = '0xde3A24028580884448a5397872046a019649b084'

async function tvl(timestamp, block) {
  const {uniswapFactory} = await request(
    graphUrl,
    graphQuery,
    {
      block,
    }
  );
  const usdTvl = Number(uniswapFactory.totalLiquidityUSD)

  return {
    [usdtAddress]: (usdTvl * 1e6).toFixed(0)
  }
}

module.exports = {
  ethereum:tvl,
  tvl
}