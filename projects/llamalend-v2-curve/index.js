const chainContracts = {
  optimism: "0x5F94073E3f51c1FFf92ffc6b4B06b7Af193B3640",
}

const uniq = (arr) => Array.from(new Set(arr))

async function getControllers(api, factory) {
  const vaults = await api.fetchList({ lengthAbi: 'market_count', itemAbi: 'markets', target: factory })
  return api.multiCall({ abi: 'address:controller', calls: vaults })
}

module.exports = Object.keys(chainContracts).reduce((all, chain) => ({
  ...all,
  [chain]: {
    tvl: async (_t, _b, _c, { api }) => {
      const markets = await getControllers(api, chainContracts[chain])
      const amms = await api.multiCall({ abi: 'address:amm', calls: markets })
      const collat = await api.multiCall({ abi: 'address:collateral_token', calls: markets })
      const borrowTokens = await api.multiCall({ abi: 'address:borrowed_token', calls: markets })
      return api.sumTokens({ tokens: uniq(collat.concat(borrowTokens)), owners: uniq(amms.concat(markets)) })
    },
    borrowed: async (_t, _b, _c, { api }) => {
      const markets = await getControllers(api, chainContracts[chain])
      const debt = await api.multiCall({ abi: 'uint256:total_debt', calls: markets })
      const borrowTokens = await api.multiCall({ abi: 'address:borrowed_token', calls: markets })
      debt.forEach((d, i) => {
        api.add(borrowTokens[i], d)
      })
      return api.getBalances()
    },
  },
}), {})

module.exports.methodology = 'TVL is the sum of collateral and borrowed tokens held in LLAMMA AMMs and market controllers. Borrowed is total debt across all v2 markets.'
module.exports.hallmarks = [
  ['2026-06-10', 'Llamalend v2 launch on Optimism'],
]
