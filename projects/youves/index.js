const { GraphQLClient, gql } = require("graphql-request");
const retry = require('../helper/retry')
const sdk = require("@defillama/sdk")
const { usdtAddress } = require('../helper/balances')
const { addDexPosition, getTokenBalances, resolveLPPosition, getStorage, convertBalances, } = require('../helper/tezos')
const { getFixBalances } = require('../helper/portedTokens')
const { dexes, farms } = require('./data')
const { PromisePool } = require('@supercharge/promise-pool');
const { default: BigNumber } = require("bignumber.js");
let graphQLClient

const indexer = "https://youves-mainnet-indexer.prod.gke.papers.tech/v1/graphql"
const engines = {
  uUSDTezos: 'KT1FFE2LC5JpVakVjHm5mM36QVp2p3ZzH4hH',
  uUSDtzBTCLP: 'KT1FzcHaNhmpdYPNTgfb8frYXx7B5pvVyowu',
  uDefiuUSD: 'KT1B2GSe47rcMCZTRk294havTpyJ36JbgdeB',
  uBTCTezos: 'KT1VjQoL5QvyZtm9m1voQKNTNcQLi5QiGsRZ',
  uBTCtzBTCLP: 'KT1NFWUqr9xNvVsz2LXCPef1eRcexJz5Q2MH',
}

const uDEFI_LP = 'KT1H8sJY2VzrbiX4pYeUVsoMUd4iGw2DV7XH'
const uDEFI_TOKEN = 'KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW-1'


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
    const balancetZ = balance * sharePrice.xtzPool / sharePrice.lqtTotal
    const balanceBTC = balance * sharePrice.tokenPool / sharePrice.lqtTotal
    sdk.util.sumSingleBalance(balances, 'tezos', balancetZ / 1e6)
    sdk.util.sumSingleBalance(balances, sharePrice.tokenAddress, balanceBTC)
    return;
  }

  sdk.util.sumSingleBalance(balances, token, balance)
}


async function getTzBTCLPSharePrice() {
  return getStorage('KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5')
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
  return convertBalances(balances)
}

async function pool2() {
  const balances = {}
  const fixBalances = await getFixBalances('tezos')

  const youvesLPs = dexes.map(i => i.contractAddress).filter(i => i)
  let eligibleFarms = farms.filter(i => !youvesLPs.includes(i.lpToken)).map(({ farmContract, lpToken: { contractAddress } }) => ({ farmContract, contractAddress }))

  await PromisePool
    .withConcurrency(3)
    .for(youvesLPs)
    .process(account => addDexPosition({ balances, account }))

  for (const { farmContract, contractAddress } of eligibleFarms)
    await resolveLPPosition({ balances, lpToken: contractAddress, owner: farmContract, ignoreList: youvesLPs })

  fixBalances(balances)
  if (balances[`tezos:${uDEFI_TOKEN}`]) {
    const uDefiPrice = await getUDefiPriceTEZ()

    sdk.util.sumSingleBalance(balances, 'tezos', +BigNumber(balances[`tezos:${uDEFI_TOKEN}`]).multipliedBy(uDefiPrice).toFixed(0))
    delete balances[`tezos:${uDEFI_TOKEN}`]
  }
  return balances
}

async function getUDefiPriceTEZ() {
  const poolTokens = await getTokenBalances(uDEFI_LP)
  return BigNumber(poolTokens.tezos).dividedBy(poolTokens[uDEFI_TOKEN])
}

module.exports = {
  timetravel: false,
  tezos: {
    tvl,
    pool2,
  }
}
