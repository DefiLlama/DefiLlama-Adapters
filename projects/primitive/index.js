const sdk = require("@defillama/sdk");
const { getLogs } = require('../helper/cache/getLogs')

const engine_weth_usdc = '0xd3541aD19C9523c268eDe8792310867C57BE39e4' // WETH-USDC Pair
const engines = [engine_weth_usdc]

const rmmTVL = async function tvl(api) {
  const risky = await api.multiCall({  abi: 'address:risky', calls: engines})
  const stable = await api.multiCall({  abi: 'address:stable', calls: engines})
  const toa = []
  risky.forEach((v, i) => toa.push([v, engines[i]]))
  stable.forEach((v, i) => toa.push([v, engines[i]]))
  return api.sumTokens({ tokensAndOwners: toa })
}

const getUnderlyingTokenAddress = "address:getUnderlyingTokenAddress"
const getStrikeTokenAddress = "address:getStrikeTokenAddress"

const START_BLOCK = 11142900
const REGISTRY = '0x16274044dab9635Df2B5AeAF7CeCb5f381c71680'

const v1TVL = async function tvl(api) {
  const logs = (await getLogs({
    api,
    target: REGISTRY,
    fromBlock: START_BLOCK,
    onlyArgs: true,
    eventAbi: 'event DeployedOptionClone (address indexed from, address indexed optionAddress, address indexed redeemAddress)'
  }))

  const tokensAndOwners = []
  const options = logs.map(i => i.optionAddress)
  const underlying = await api.multiCall({  abi: getUnderlyingTokenAddress, calls: options})
  const strikes = await api.multiCall({  abi: getStrikeTokenAddress, calls: options})
  underlying.forEach((v, i) => tokensAndOwners.push([v, options[i]]))
  strikes.forEach((v, i) => tokensAndOwners.push([v, options[i]]))
  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  ethereum: {
    start: '2022-03-22', // unix timestamp (utc 0) specifying when the project began, or where live data begins
    tvl: sdk.util.sumChainTvls([rmmTVL, v1TVL, ]), // 
  },
}