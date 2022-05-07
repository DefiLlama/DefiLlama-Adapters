// starbank
const { request, gql } = require("graphql-request");
const {toUSDTBalances} = require("../helper/balances");

const graphUrl =
    'https://graph-node1.starbank.finance/subgraphs/name/starbank-finance/balancer2';


// const graphQuery = gql`
//   query { pools { totalLiquidity } }
// `;

const graphQuery = gql`query { balancers (first: 1) { totalLiquidity totalSwapFee totalSwapVolume poolCount } }`;

async function tvl() {
  const response = await request(
    graphUrl,
    graphQuery,
    );

  // return toUSDTBalances(response.pools[0].totalLiquidity)
  return toUSDTBalances(response.balancers[0].totalLiquidity)
}

module.exports = {
    astar:{
        tvl,
    },
};
