const retry = require('../helper/retry')
const {toUSDTBalances} = require('../helper/balances')
const { GraphQLClient, gql } = require('graphql-request')

const API_URL = 'https://api.aldrin.com/graphql'

async function tvl(timestamp) {
  var graphQLClient = new GraphQLClient(API_URL)

  const timestampFrom = Math.floor(timestamp - 60 * 60)
  const timestampTo = Math.floor(timestamp)

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
  return toUSDTBalances(results.getTotalVolumeLockedHistory.volumes[0].vol)
}

module.exports = {
  misrepresentedTokens: true,
  tvl
}
