const retry = require('async-retry')
const { GraphQLClient, gql } = require('graphql-request')

var endpoint ='https://d2c7awq32ho327.cloudfront.net/graphql';
  var graphQLClient = new GraphQLClient(endpoint)

  var platformTVLQuery = gql`
    {
      getTVL {
        platformTVL,
        borrowingTVL
    }

  }
  `;


  var borrowingTVLQuery = gql`
    {
      getTVL {
        borrowingTVL
    }

  }
  `;
async function fetch() {
  try {
    const {getTVL} = await retry(async bail => await graphQLClient.request(platformTVLQuery))
    return Promise.resolve(getTVL.platformTVL-getTVL.borrowingTVL)
  } catch (err) {
    Promise.reject(err)
  }
}  


async function borrowed() {
  try {
    const {getTVL} = await retry(async bail => await graphQLClient.request(borrowingTVLQuery))
    return Promise.resolve(getTVL.borrowingTVL)
  } catch (err) {
    Promise.reject(err)
  }
}  

module.exports = {
  borrowed:{
    fetch:borrowed
  },
  fetch
}