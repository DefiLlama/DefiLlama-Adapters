const getUnderlyingTokenAddress = "address:getUnderlyingTokenAddress"
const getStrikeTokenAddress = "address:getStrikeTokenAddress"
const { getLogs } = require('../helper/cache/getLogs')

const START_BLOCK = 11142900
const REGISTRY = '0x16274044dab9635Df2B5AeAF7CeCb5f381c71680'

module.exports = async function tvl(api) {
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
