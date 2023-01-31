const utils = require("../helper/utils");
const { toUSDTBalances } = require("../helper/balances");
const poolApiUrl = 'https://api.nodes-brewlabs.info/api/pools'
const farmApiUrl = 'https://api.nodes-brewlabs.info/api/farms'
const pricesApiUrl = 'https://api.nodes-brewlabs.info/api/prices'

const blacklist = ["0x2f6ad7743924b1901a0771746152dde44c5f11de", "0xfd6bc48f68136e7bf4ae1fb4b0c2e6911a50e18b", "0xafbb5dafacea3cfe1001357449e2ea268e50f368", "0x7db5af2b9624e1b3b4bb69d6debd9ad1016a58ac"]
const getpricesMapId = (chain, type, address) => 'c' + chain + '_' + type + address.toLowerCase()
const chains = {
  ethereum: 1,
  polygon: 137,
  fantom: 250,
  bsc: 56,
  avax: 43114,
  bitgert: 32520,
  cronos: 25
}
async function calcTvl(network) {
  const data = { chainId: network }
  const poolsResult = await utils.postURL(poolApiUrl, data)
  const farmsResult = await utils.postURL(farmApiUrl, data)
  const pricesResult = await utils.fetchURL(pricesApiUrl)
  let totalValueLocked = 0
  for (const pool in poolsResult.data) {
    const chainId = poolsResult.data[pool].chainId
    const totalStaked = poolsResult.data[pool].totalStaked
    const index = getpricesMapId(chainId, 't', poolsResult.data[pool].stakingToken.address)
    const price = pricesResult.data.tokenPrices[index]
    if (blacklist.filter(val => val == poolsResult.data[pool].stakingToken.address.toLowerCase()).length === 0 && (totalStaked > 0) && (chainId === network)) totalValueLocked += price ? price * totalStaked : 0
  }
  for (const farm in farmsResult.data) {
    const chainId = farmsResult.data[farm].chainId
    const totalStaked = farmsResult.data[farm].totalStaked
    const index = getpricesMapId(chainId, 'l', farmsResult.data[farm].lpAddress)
    const price = pricesResult.data.lpPrices[index]
    if (blacklist.filter(val => val == farmsResult.data[farm].lpAddress.toLowerCase()).length === 0 && totalStaked > 0 && chainId === network) totalValueLocked += price ? price * totalStaked : 0
  }
  return toUSDTBalances(totalValueLocked)
}
function brewlabs(chain) {
  return async (timestamp, ethBlock, { [chain]: block }) => {
    const tvl = calcTvl(chains[chain])
    return tvl
  }
}
module.exports = {
  brewlabs,
  methodology: `TVL of BrewLabs Platform`,

}