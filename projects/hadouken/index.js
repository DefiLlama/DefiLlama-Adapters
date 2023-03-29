const { GraphQLClient, gql } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");

const endpoint = "https://graph-multi-http-hadouken.hadouken.finance/subgraphs/name/balancer-mainnet"

const query = gql`
  query hadoukenTotalLiquidity {
      balancers {
      totalLiquidity
    }
}`

const graphQLClient = new GraphQLClient(endpoint)

const fetchTotalLiquidity = async () => {
  try {
    const result = await graphQLClient.request(query)
    
    return toUSDTBalances(result.balancers[0].totalLiquidity);
  } catch {
    return 0
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Returns total liquidity using Hadouken subgraph",
  godwoken_v1: {
    tvl: fetchTotalLiquidity
  }
}
