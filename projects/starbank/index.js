// starbank
const { request, gql } = require("graphql-request");
const {toUSDTBalances} = require("../helper/balances");

const graphUrl =
    'https://graph-node1.starbank.finance/subgraphs/name/starbank-finance/balancer2';


const graphQuery = gql`
  query {
    pools(
      first: 1000
      orderBy: "totalLiquidity"
      orderDirection: "desc"
      where: {
        totalShares_gt: 0.01
        id_not_in: [
          "0x8be1881b9b95ce2c267be6cdfa6c18b7d07e6188000200000000000000000000"
        ]
        id_in: [
          "0x76b2250ce870f83240d3e97802c44204d182efb8000000000000000000000000"
        ]
      }
      block: { number: 964331 }
    ) {
      totalLiquidity
    }
  }
`;

async function tvl() {
  const response = await request(
    graphUrl,
    graphQuery,
    );

  return toUSDTBalances(response.pools[0].totalLiquidity)
}

module.exports = {
    astar:{
        tvl,
    },
};
