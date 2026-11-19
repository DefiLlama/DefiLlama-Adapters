const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  ethereum: '0x9117440a7d03238905d1c8908157bd7a547c77c8',
}

async function getMarkets(api) {
  const registry = config[api.chain]
  const troveManagers = await api.call({ target: registry, abi: 'address[]:get_all_markets' })
  const collateralTokens = await api.multiCall({ abi: 'address:collateral_token', calls: troveManagers })
  const borrowTokens = await api.multiCall({ abi: 'address:borrow_token', calls: troveManagers })
  const lenders = await api.multiCall({ abi: 'address:lender', calls: troveManagers })
  return { troveManagers, collateralTokens, borrowTokens, lenders }
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const { troveManagers, collateralTokens, borrowTokens, lenders } = await getMarkets(api)
      return sumTokens2({
        api,
        tokensAndOwners2: [
          [...collateralTokens, ...borrowTokens],
          [...troveManagers, ...lenders],
        ],
      })
    },
    borrowed: async (api) => {
      const { troveManagers, borrowTokens } = await getMarkets(api)
      const debts = await api.multiCall({ abi: 'uint256:total_debt', calls: troveManagers })
      api.add(borrowTokens, debts)
    },
  }
})
