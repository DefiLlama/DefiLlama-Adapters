const apolloClient = require('apollo-client');
const fetcher = require('node-fetch');
const gql = require('graphql-tag');
const httpLink = require('apollo-link-http');
const inMemoryCache = require('apollo-cache-inmemory');

async function fetch() {

  const client = new apolloClient.ApolloClient({
    link: new httpLink.HttpLink({
      uri: 'https://graphnode.energiswap.info:8000/subgraphs/name/energi/energiswap',
      fetch: fetcher
    }),
    cache: new inMemoryCache.InMemoryCache(),
    shouldBatch: true,
  });

  const GLOBAL_DATA = () => {
    const queryString = ` query energiswapFactories {
        energiswapFactories(
        where: { id: "0xa2dAE9e70D5A08B781DeE134617Cf5E7D23043c2" }) { 
          totalLiquidityUSD
        }
      }`
    return gql(queryString)
  };

  let result = await client.query({
    query: GLOBAL_DATA(),
    fetchPolicy: 'cache-first',
  });

  // console.log(result.data.energiswapFactories[0].totalLiquidityUSD);
  return result.data.energiswapFactories[0].totalLiquidityUSD;
}

module.exports = {
  fetch
}
