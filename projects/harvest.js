const { getConfig } = require('./helper/cache')
const { sumTokens2 } = require('./helper/unwrapLPs')

// historical tvl on https://ethparser-api.herokuapp.com/api/transactions/history/alltvl?network=eth
const endpoint = "https://api.harvest.finance/vaults?key=41e90ced-d559-4433-b390-af424fdc76d6"
const chains = {
  ethereum: 'eth',
  // bsc: 'bsc',
  arbitrum: 'arbitrum',
  base: 'base',
  polygon: 'matic'
}

module.exports = {}
Object.keys(chains).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const response = await getConfig('harvest', endpoint)
      const vaults = Object.values(response[chains[chain]]).map(i => i.vaultAddress)
      const strategy = await api.multiCall({ abi: 'address:strategy', calls: vaults })
      const tokensV = await api.multiCall({ abi: 'address:underlying', calls: vaults, permitFailure: true })
      const tokens = await api.multiCall({ abi: 'address:underlying', calls: strategy, permitFailure: true })
      const bals2 = await api.multiCall({ abi: 'uint256:underlyingBalanceWithInvestment', calls: vaults, permitFailure: true })
      tokens.forEach((token, idx) => {
        if (!token) token = tokensV[idx]
        if (token) api.add(token, bals2[idx])
      })
      return sumTokens2({ api, resolveLP: true, owners: vaults, resolveUniV3: chain !== 'base', permitFailure: true })
    }
  }
})
