const retry = require('../helper/retry')
const { toUSDTBalances } = require('../helper/balances')
const { GraphQLClient, gql } = require('graphql-request')

const API_URL = 'https://api.aldrin.com/graphql'

async function tvl(timestamp) {
  var graphQLClient = new GraphQLClient(API_URL)
  const timestampFrom = Math.floor(timestamp - 60 * 60)
  const timestampTo = Math.floor(timestamp)
  const currentDate = new Date(timestamp * 1000).toISOString().slice(0,10)

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
  const {
    getTotalVolumeLockedHistory: {
      volumes
    }
  } = results
  const volumeToday = volumes.find(i => i.date === currentDate)
  return toUSDTBalances(volumeToday.vol)
}

module.exports = {
  misrepresentedTokens: true,
  solana: { tvl }
}
