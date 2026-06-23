const ADDRESSES = require('../helper/coreAssets.json')
const { GraphQLClient, gql } = require("graphql-request");
const sdk = require("@defillama/sdk")
const { addDexPosition, resolveLPPosition, getStorage, usdtAddressTezos, } = require('../helper/chain/tezos')
const { dexes, farms } = require('./data')
const { PromisePool } = require('@supercharge/promise-pool');
let graphQLClient

const indexer = "https://indexer.youves.com/v1/graphql"
const engines = {
  uUSDTezosV1: 'KT1FFE2LC5JpVakVjHm5mM36QVp2p3ZzH4hH',
  uUSDTezosV3: 'KT1DHndgk8ah1MLfciDnCV2zPJrVbnnAH9fd',
  uUSDUSDtV3: 'KT1JmfujyCYTw5krfu9bSn7YbLYuz2VbNaje',
  uUSDtzBTCV3: 'KT1V9Rsc4ES3eeQTr4gEfJmNhVbeHrAZmMgC',
  uUSDtzBTCV2: 'KT1HxgqnVjGy7KsSUTEsQ6LgpD5iKSGu7QpA',
  uUSDtzBTCLPV2: 'KT1FzcHaNhmpdYPNTgfb8frYXx7B5pvVyowu',
  uUSDtzBTCLPV3: 'KT1F1JMgh6SfqBCK6T6o7ggRTdeTLw91KKks',
  uDefiuUSDV2: 'KT1B2GSe47rcMCZTRk294havTpyJ36JbgdeB',
  uDefitzV2: 'KT1LQcsXGpmLXnwrfftuQdCLNvLRLUAuNPCV',
  uDefitzBTCLPV2: 'KT1E45AvpSr7Basw2bee3g8ri2LK2C2SV2XG',
  uBTCTezosV2: 'KT1VjQoL5QvyZtm9m1voQKNTNcQLi5QiGsRZ',
  uBTCTezosV3: 'KT1CP1C8afHqdNfBsSE3ggQhzM2iMHd4cRyt',
  uBTCtzBTCLPV2: 'KT1NFWUqr9xNvVsz2LXCPef1eRcexJz5Q2MH',
  uBTCtzBTCLPV3: 'KT1G6RzVX25YnoU55Xb7Vve3zvuZKmouf24a',
}

const uDEFI_LP = 'KT1H8sJY2VzrbiX4pYeUVsoMUd4iGw2DV7XH'
const uDEFI_TOKEN = 'KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW-1'
const tzBTC_TOKEN = ADDRESSES.tezos.tzBTC


async function fetchBalance(balances, token, engineAddress, decimals = 0, sharePrice) {
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

  const oracleData = await graphQLClient.request(query)
  let balance = oracleData["vault_aggregate"]["aggregate"]["sum"]["balance"] / 10 ** decimals

  if (token === 'tzbtc-lp') {
    const balancetZ = balance * sharePrice.xtzPool / sharePrice.lqtTotal
    const balanceBTC = balance * sharePrice.tokenPool / sharePrice.lqtTotal
    sdk.util.sumSingleBalance(balances, 'tezos', balancetZ / 1e6, 'tezos')
    sdk.util.sumSingleBalance(balances, sharePrice.tokenAddress, balanceBTC, 'tezos')
    return;
  }

  sdk.util.sumSingleBalance(balances, token, balance, 'tezos')
}


async function getTzBTCLPSharePrice() {
  return getStorage('KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5')
}

async function tvl() {
  graphQLClient = new GraphQLClient(indexer);
  const balances = {}
  const sharePrice = await getTzBTCLPSharePrice()
  await Promise.all([
    // fetchBalance(balances, ADDRESSES.tezos.uUSD, engines.uDefiuUSDV2, 0),  // disabling this because backing of uUSD is already counted in tvl
    fetchBalance(balances, usdtAddressTezos, engines.uUSDUSDtV3, 0),
    fetchBalance(balances, tzBTC_TOKEN, engines.uUSDtzBTCV2, 0),
    fetchBalance(balances, tzBTC_TOKEN, engines.uUSDtzBTCV3, 0),
    fetchBalance(balances, 'tezos', engines.uUSDTezosV1, 6),
    fetchBalance(balances, 'tezos', engines.uUSDTezosV3, 6),
    fetchBalance(balances, 'tezos', engines.uBTCTezosV2, 6),
    fetchBalance(balances, 'tezos', engines.uBTCTezosV3, 6),
    fetchBalance(balances, 'tezos', engines.uDefitzV2, 6),
    fetchBalance(balances, 'tzbtc-lp', engines.uUSDtzBTCLPV2, 0, sharePrice),
    fetchBalance(balances, 'tzbtc-lp', engines.uUSDtzBTCLPV3, 0, sharePrice),
    fetchBalance(balances, 'tzbtc-lp', engines.uBTCtzBTCLPV2, 0, sharePrice),
    fetchBalance(balances, 'tzbtc-lp', engines.uBTCtzBTCLPV3, 0, sharePrice),
    fetchBalance(balances, 'tzbtc-lp', engines.uDefitzBTCLPV2, 0, sharePrice),
  ])

  return balances
}

async function pool2() {
  const balances = {}

  const youvesLPs = dexes.map(i => i.contractAddress).filter(i => i)
  let eligibleFarms = farms.filter(i => !youvesLPs.includes(i.lpToken)).map(({ farmContract, lpToken: { contractAddress } }) => ({ farmContract, contractAddress }))

  await PromisePool
    .withConcurrency(3)
    .for(youvesLPs)
    .process(account => addDexPosition({ balances, account }))

  const promises = []
  for (const { farmContract, contractAddress } of eligibleFarms)
    promises.push(resolveLPPosition({ balances, lpToken: contractAddress, owner: farmContract, ignoreList: youvesLPs }))
  await Promise.all(promises)

  return balances
}

module.exports = {
  timetravel: false,
  tezos: { tvl, pool2 }
}