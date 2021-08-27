const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');
const retry = require('async-retry')
const axios = require("axios");

const graphUrl = 'https://api.thegraph.com/subgraphs/name/ubeswap/ubeswap'
const graphQuery = gql`
query get_tvl($block: Int) {
	ubeswapFactories(
    block: { number: $block }
  ) {
    totalVolumeUSD
    totalLiquidityUSD
  }
}
`;

async function tvl(timestamp) {
  const block = Number((await retry(async bail => await axios.get("https://explorer.celo.org/api?module=block&action=getblocknobytime&timestamp=" + timestamp + "&closest=before"))).data.result.blockNumber);
  const {ubeswapFactories} = await request(
    graphUrl,
    graphQuery,
	{ block }
  );
  const usdTvl = Number(ubeswapFactories[0].totalLiquidityUSD);

  return toUSDTBalances(usdTvl);
}

module.exports = {
  misrepresentedTokens: true,
  celo: {
    tvl,
  },
  tvl
}