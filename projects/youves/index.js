const { GraphQLClient, gql } = require("graphql-request");
const retry = require('../helper/retry')
const sdk = require("@defillama/sdk")
const { usdtAddress } = require('../helper/balances')
let graphQLClient

const indexer = "https://youves-mainnet-indexer.dev.gke.papers.tech/v1/graphql"
const engines = {
  uUSDTezos: 'KT1FFE2LC5JpVakVjHm5mM36QVp2p3ZzH4hH',
  uUSDtzBTCLP: 'KT1FzcHaNhmpdYPNTgfb8frYXx7B5pvVyowu',
  uDefiuUSD: 'KT1B2GSe47rcMCZTRk294havTpyJ36JbgdeB',
  uBTCTezos: 'KT1VjQoL5QvyZtm9m1voQKNTNcQLi5QiGsRZ',
  uBTCtzBTCLP: 'KT1NFWUqr9xNvVsz2LXCPef1eRcexJz5Q2MH',
}


async function fetchBalance(balances, token, engineAddress, decimals = 1, sharePrice) {
  const query = gql`
{
  vault_aggregate(where: { engine_contract_address: { _eq: "${engineAddress}" } }) {
    aggregate {
      sum {
        balance
      }
    }
  }
}
`

  const oracleData = await retry(async req => await graphQLClient.request(query))
  let balance = oracleData["vault_aggregate"]["aggregate"]["sum"]["balance"] / 10 ** decimals

  if (token === 'tzbtc-lp') {
    balance = balance * sharePrice * 10 ** 6
    token = usdtAddress
  }
    
  sdk.util.sumSingleBalance(balances, token, balance)
}


async function getTzBTCLPSharePrice() {
  const client = new GraphQLClient('https://api.dipdup.net/dex/graphql');
  const query = gql`
{
  exchange(where: { address: { _eq: "KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5" } }) {
    sharePxUsd
  },
}
`

  const response = await client.request(query)
  return +response.exchange[0].sharePxUsd
}

async function tvl() {
  graphQLClient = new GraphQLClient(indexer);
  const balances = {}
  const sharePrice = await getTzBTCLPSharePrice()
  await Promise.all([
    fetchBalance(balances, 'tezos', engines.uUSDTezos, 6),
    fetchBalance(balances, 'tezos', engines.uBTCTezos, 6),
    fetchBalance(balances, usdtAddress, engines.uDefiuUSD, 6),
    fetchBalance(balances, 'tzbtc-lp', engines.uUSDtzBTCLP, 0, sharePrice),
    fetchBalance(balances, 'tzbtc-lp', engines.uBTCtzBTCLP, 0, sharePrice),
  ])
  return balances
}

module.exports = {
  tezos: {
    tvl
  }
}
