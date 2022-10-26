const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");

const backendGraphUrlBsc = "https://dex-backend-prod.herokuapp.com/graphql";

const backendTvlGraphQuery = gql`
  query get_tvl {
    data: beetsGetProtocolData {
      totalLiquidity
    }
  }`;

async function bscTvl(timestamp, ...params) {
  if (Math.abs(timestamp - Date.now() / 1000) < 3600 / 2) {
    const { data } = await request(backendGraphUrlBsc, backendTvlGraphQuery);
    return toUSDTBalances(data.totalLiquidity);
  }}

module.exports = {
  misrepresentedTokens: true,
  incentivized: true,
  methodology: `Aequinox TVL is pulled from its subgraph. It includes deposits made to the liquidity pools.`,
  bsc: {
    tvl: bscTvl,    
  },
};