const { GraphQLClient, gql } = require('graphql-request')
const { stakingPricedLP } = require('../helper/staking')
const { toUSDTBalances } = require('../helper/balances')

const FACTORY = "0x5ef0d2d41a5f3d5a083bc776f94282667c27b794"
const MASTERCHEF = "0x62493bFa183bB6CcD4b4e856230CF72f68299469"
const WCKB = "0xe934f463d026d97f6ce0a10215d0ac4224f0a930"
const YOK = "0xb02c930c2825a960a50ba4ab005e8264498b64a0"

async function fetch() {
    const endpoint = 'https://www.yokaiswap.com/subgraphs/name/yokaiswap/exchange'
    const graphQLClient = new GraphQLClient(endpoint)

    const query = gql`
      query yokaiFactories {
        yokaiFactories { 
          totalLiquidityUSD
        }
      }`;

    const data = await graphQLClient.request(query);

    return toUSDTBalances(data.yokaiFactories[0].totalLiquidityUSD);
}

module.exports = {
    methodology: `Finds TotalLiquidityUSD using the YokaiSwap subgraph "https://www.yokaiswap.com/subgraphs/name/yokaiswap/exchange".`,
    godwoken: {
      tvl: fetch,
      //staking: stakingPricedLP(MASTERCHEF,YOK,"godwoken","0x8967aF2789aabbc6Ff68BD75336b09e6E4303C98", "nervos-network")
    }
}