const { getConfig } = require('./helper/cache')
const { sumTokens2 } = require('./helper/unwrapLPs')

// historical tvl on https://ethparser-api.herokuapp.com/api/transactions/history/alltvl?network=eth
const endpoint = "https://api.harvest.finance/vaults?key=41e90ced-d559-4433-b390-af424fdc76d6"
const chains = {
  ethereum: 'eth',
  arbitrum: 'arbitrum',
  base: 'base',
  polygon: 'matic',
  era: 'zksync'
}

const tvl = async (api) => {
  const response = await getConfig('harvest', endpoint)
  const rawVaults = Object.values(response[chains[api.chain]]).map(i => i.vaultAddress)
  const strategies = await api.multiCall({ abi: 'address:strategy', calls: rawVaults, permitFailure: true })

  const vaults = rawVaults.map((vault, i) => {
    const strategy = strategies[i]
    if (!strategy) return null
    return { vault, strategy }
  }).filter(Boolean)

  const tokensV = await api.multiCall({ abi: 'address:underlying', calls: vaults.map(({ vault }) => ({ target: vault })), permitFailure: true })
  const tokens = await api.multiCall({ abi: 'address:underlying', calls: vaults.map(({ strategy }) => ({ target: strategy })), permitFailure: true })
  const bals2 = await api.multiCall({ abi: 'uint256:underlyingBalanceWithInvestment', calls: vaults.map(({ vault }) => ({ target: vault })), permitFailure: true })

  tokens.forEach((token, i) => {
    if (!token) token = tokensV[i]
    if (token) api.add(token, bals2[i])
  })

  const apVaults = Object.values(response[chains[api.chain]]).filter(i => i.isIPORVault).map(i => i.vaultAddress)
  const apTokens = await api.multiCall({ abi: 'address:asset', calls: apVaults, permitFailure: true })
  const apBals = await api.multiCall({ abi: 'uint256:totalAssets', calls: apVaults, permitFailure: true })
  
  apTokens.forEach((token, i) => {
    if (token) api.add(token, apBals[i])
  })

  return sumTokens2({ api, resolveLP: true, owners: vaults.map(({ vault }) => vault), resolveUniV3: api.chain !== 'base' && api.chain !== 'era', permitFailure: true })
}

Object.keys(chains).forEach((chain) => {
  module.exports[chain] = { tvl }
})