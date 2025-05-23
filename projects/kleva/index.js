const sdk = require("@defillama/sdk")
const { getConfig } = require('../helper/cache')

const { userInfos } = require('./FairLaunch')

const { getChainTransform } = require('../helper/portedTokens')
const { getTokenPrices } = require('../helper/unknownTokens')
const kExports = require('../kleva-lend')

const chain = 'klaytn'
// const TOKEN_PRICE_QUERY_URL = "https://api.kltalchemy.com/klay/ksInfo"
const WORKERS_QUERY_URL = "https://kleva.io/static/data.json"

async function getWorkers() {
  return getConfig('kleva', WORKERS_QUERY_URL)
}

// Fetch farm list
// - multicall 'userInfos' on FairLaunch contract with lpPoolId & workerAddress
async function getFarmingTVL(data, balances,) {
  const transform = await getChainTransform(chain)
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

  Object.entries(balancesTemp).forEach(([token, value]) => sdk.util.sumSingleBalance(balances, token, value))

  return balances
}

async function fetchLiquidity() {
  const data = await getWorkers()
  const balances = {}
  return getFarmingTVL(data, balances)
}

module.exports = {
  deadFrom: '2025-01-01',
  hallmarks: [[1711929600,'Sunset of Kleva-Farm']],
  klaytn: { tvl: sdk.util.sumChainTvls([fetchLiquidity, kExports.klaytn.tvl]) },
  doublecounted: true,
}