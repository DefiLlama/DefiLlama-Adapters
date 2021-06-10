const retry = require('./helper/retry')
const { GraphQLClient, gql } = require('graphql-request')

async function fetch() {
    var endpoint = 'https://cache.bondappetit.io/api'
    var graphQLClient = new GraphQLClient(endpoint)

    var query = gql`
    {
        getTVL
    }
    `;

    var results = await retry(async bail => await graphQLClient.request(query))
    return parseFloat(results.getTVL)
}

fetch();

module.exports = {
  fetch
}
