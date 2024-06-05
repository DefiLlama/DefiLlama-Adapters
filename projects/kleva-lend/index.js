const { getConfig } = require('../helper/cache')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const WORKERS_QUERY_URL = "https://kleva.io/static/data.json"

async function getWorkers() {
  return getConfig('kleva', WORKERS_QUERY_URL)
}

const klayPool = '0xa691c5891d8a98109663d07bcf3ed8d3edef820a'
const wKlay = '0xf6f6b8bd0ac500639148f8ca5a590341a97de0de'

async function getLendingTVL(data, api) {
  const tokensAndOwners = data.lendingPools.map(({ vaultAddress, ibToken: { originalToken }}) => {
    if (vaultAddress.toLowerCase() === klayPool)
      return [wKlay, klayPool]
    return [originalToken.address, vaultAddress]
  })
  tokensAndOwners.push([nullAddress, klayPool])
  return sumTokens2({ api, tokensAndOwners })
}

async function tvl(api) {
  const data = await getWorkers()
  return getLendingTVL(data, api)
}

async function borrowed(api) {
  const data = await getWorkers()
  const vaults = data.lendingPools.map(({ vaultAddress }) => vaultAddress)
  const tokens = await api.multiCall({  abi: 'address:getBaseTokenAddress', calls: vaults}) 
  const debts = await api.multiCall({  abi: 'uint256:totalDebtAmount', calls: vaults}) 
  api.addTokens(tokens,debts)
}

module.exports = {
  klaytn: { tvl, borrowed },
}