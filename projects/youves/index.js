const { GraphQLClient, gql } = require("graphql-request");
const retry = require('../helper/retry')

const indexer = "http://youves-indexer.prod.gke.papers.tech/v1/graphql"
var query = gql`
{
    vault_aggregate {
      aggregate {
      sum {balance}
      }
    }
  }
`
async function tvl() {
    const graphQLClient = new GraphQLClient(indexer);
    const oracleData = await retry(async req => await graphQLClient.request(query))

    return {
        "tezos": oracleData["vault_aggregate"]["aggregate"]["sum"]["balance"] / 1000000 
    }
}

module.exports = {
    tvl
}
