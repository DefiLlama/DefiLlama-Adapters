const retry = require('async-retry')
const { GraphQLClient, gql } = require('graphql-request')

var endpoint ='https://d2c7awq32ho327.cloudfront.net/graphql';
  var graphQLClient = new GraphQLClient(endpoint)

  var query = gql`
  {
    getTVL {
      platformTVL,
    }
  }
  `;
async function fetch() {
  try {
    const {getTVL} = await retry(async bail => await graphQLClient.request(query))
    return Promise.resolve(getTVL.platformTVL)
  } catch (err) {
    Promise.reject(err)
  }
}  

module.exports = {
    fetch
}