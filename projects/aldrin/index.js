const retry = require('../helper/retry')
const { GraphQLClient, gql } = require('graphql-request')

const API_URL = 'https://api.aldrin.com/graphql'

async function fetch() {

  var graphQLClient = new GraphQLClient(API_URL)

  const timestampFrom = Math.floor(Date.now() / 1000 - 60 * 60)
  const timestampTo = Math.floor(Date.now() / 1000)

  var query = gql`
    {
      getTotalVolumeLockedHistory(
        timezone: "UTC", 
        timestampFrom: ${timestampFrom}, 
        timestampTo: ${timestampTo}
      ) {
        volumes {
          vol
          date
        }
      }
    }
    `;

  const results = await retry(async bail => await graphQLClient.request(query))
  return results.getTotalVolumeLockedHistory.volumes[0].vol
}

module.exports = {
  fetch
}
