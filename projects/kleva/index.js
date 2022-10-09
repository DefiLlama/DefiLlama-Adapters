const sdk = require("@defillama/sdk")
const retry = require('async-retry')
const axios = require("axios")
const BigNumber = require("bignumber.js")

const { userInfos } = require('./FairLaunch')
const { getTotalToken } = require('./IbToken')

const { toUSDTBalances } = require('../helper/balances')

const chain = 'klaytn'
const TOKEN_PRICE_QUERY_URL = "https://api.kltalchemy.com/klay/ksInfo"
const WORKERS_QUERY_URL = "https://kleva.io/static/data.json"

async function getWorkers() {
  const { data } = await retry(async bail => await axios.get(WORKERS_QUERY_URL))
  return data
}

// Fetch token & lp token prices
async function getTokenPrice() {
  const { data: tokenInfo } = await retry(async bail => await axios.get(TOKEN_PRICE_QUERY_URL))
  return {
    klayPrice: tokenInfo.klayPrice,
    ["0x" + "0".repeat(40)]: tokenInfo.klayPrice,
    ...tokenInfo.priceOutput
  }
}

// Fetch farm list
// - multicall 'userInfos' on FairLaunch contract with lpPoolId & workerAddress
async function getFarmingTVL(data, tokenPrice) {

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

  const depositedPerWorker = farmResult.reduce((acc, { input, output }) => {
    const workerAddress = input.params[1]
    const worker = data.workerInfo[workerAddress]
    const stakingToken = worker.lpToken

    const depositedInUSD = new BigNumber(output.amount)
      .div(10 ** stakingToken.decimals)
      .multipliedBy(tokenPrice[stakingToken.address.toLowerCase()])
      .toNumber()

    acc[workerAddress] = depositedInUSD

    return acc
  }, {})

  const farmingTVL = Object.values(depositedPerWorker).reduce((acc, cur) => acc += cur)

  return farmingTVL
}

// Fetch lending pool(ibToken) list
// - multicall 'getTotalToken' on ibToken contracts
async function getLendingTVL(data, tokenPrice) {
  const { output: lendingResult } = await sdk.api.abi.multiCall({
    chain,
    calls: data.lendingPools.map(({ vaultAddress }) => ({
      target: vaultAddress,
      params: []
    })),
    abi: getTotalToken,
    requery: true,
  })

  const depositedPerLendingPool = lendingResult.reduce((acc, { input, output }, idx) => {
    const lendingPool = data.lendingPools[idx]
    const stakingToken = lendingPool.ibToken.originalToken

    const depositedInUSD = new BigNumber(output)
      .div(10 ** stakingToken.decimals)
      .multipliedBy(tokenPrice[stakingToken.address.toLowerCase()])
      .toNumber()

    acc[lendingPool.vaultAddress] = depositedInUSD

    return acc
  }, {})

  const lendingTVL = Object.values(depositedPerLendingPool).reduce((acc, cur) => acc += cur)

  return lendingTVL
}

async function fetchLiquidity() {
  const data = await getWorkers()
  const tokenPrice = await getTokenPrice()
  const lendingTVL = await getLendingTVL(data, tokenPrice)
  const farmingTVL = await getFarmingTVL(data, tokenPrice)

  const totalTVL = new BigNumber(farmingTVL).plus(lendingTVL).toNumber()
  return toUSDTBalances(totalTVL)
}

module.exports = {
  klaytn: { tvl: fetchLiquidity },
  timetravel: false,
}