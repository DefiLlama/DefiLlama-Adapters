const host = 'https://api.vortex.network/v1/graphql'
const retry = require('../helper/retry')
const { sumTokens2, } = require('../helper/chain/tezos')
const { GraphQLClient, gql } = require('graphql-request')
const half_hour = 30 * 60
const half_day = 12 * 60 * 60

async function tvl(ts) {
  var graphQLClient = new GraphQLClient(host)

  var query = gql`
    query tvl_per_pool($start: bigint = "", $end: bigint = "") {        data: pair {          id          pairDayData (order_by: {date: desc}, where: {date: {_gte: $start, _lte: $end}}) {            tvl: reserveUsd            timestamp: date          }        }      }    
    `;

  var { data } = await retry(async bail => await graphQLClient.request(query, { start: ts - half_day, end: ts + half_hour }))
  const accounts = data.map(i => i.id)
  return sumTokens2({ owners: accounts, includeTezos: true, })
}

async function staking() {
  return sumTokens2({ owners: ['KT1Cp18EbxDk2WcbC1YVUyGuwuvtzyujwu4U']})
}


module.exports = {
  tezos: {
    tvl,
    staking,
  },
};
