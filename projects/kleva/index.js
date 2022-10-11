const sdk = require("@defillama/sdk")
const retry = require('async-retry')
const axios = require("axios")

const { userInfos } = require('./FairLaunch')

const { sumTokens2 } = require('../helper/unwrapLPs')
const { getChainTransform, getFixBalances } = require('../helper/portedTokens')
const { getTokenPrices } = require('../helper/unknownTokens')

const chain = 'klaytn'
// const TOKEN_PRICE_QUERY_URL = "https://api.kltalchemy.com/klay/ksInfo"
const WORKERS_QUERY_URL = "https://kleva.io/static/data.json"

async function getWorkers() {
  const { data } = await retry(async bail => await axios.get(WORKERS_QUERY_URL))
  return data
}


// Fetch farm list
// - multicall 'userInfos' on FairLaunch contract with lpPoolId & workerAddress
async function getFarmingTVL(data, balances,) {
  const transform = await getChainTransform(chain)
  const fixBalances = await getFixBalances(chain)
  const balancesTemp = {}
  const lps = []

  const calls = Object.entries(data.workerInfo).map(([workerAddress, item]) => ({
    target: data.address.FAIRLAUNCH,
    params: [item.lpPoolId, workerAddress]
  }))

  const { output: farmResult } = await sdk.api.abi.multiCall({
    chain,
    calls,
    abi: userInfos,
    requery: true,
  })

  farmResult.forEach(({ input, output }) => {
    const workerAddress = input.params[1]
    const worker = data.workerInfo[workerAddress]
    const stakingToken = worker.lpToken
    sdk.util.sumSingleBalance(balancesTemp, transform(stakingToken.address), output.amount)
    lps.push(stakingToken.address)
  })

  const { updateBalances } = await getTokenPrices({ chain, lps, })

  await updateBalances(balancesTemp)

  await fixBalances(balancesTemp)
  Object.entries(balancesTemp).forEach(([token, value]) => sdk.util.sumSingleBalance(balances, token, value))

  return balances
}

// Fetch lending pool(ibToken) list
// - multicall 'getTotalToken' on ibToken contracts
async function getLendingTVL(data) {
  const tokensAndOwners = data.lendingPools.map(({ vaultAddress, ibToken: { originalToken }}) => ([originalToken.address, vaultAddress]))
  return sumTokens2({ chain, tokensAndOwners })
}

async function fetchLiquidity() {
  const data = await getWorkers()
  const balances = await getLendingTVL(data)
  return getFarmingTVL(data, balances)
}

module.exports = {
  klaytn: { tvl: fetchLiquidity },
  timetravel: false,
}