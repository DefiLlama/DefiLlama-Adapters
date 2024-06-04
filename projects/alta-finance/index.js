const ADDRESSES = require('../helper/coreAssets.json')
module.exports = {
  methodology: "Sums the amount of funded real-world assets on ALTA Finance as borrowed. Tokens left in the countract are counted towards tvl",
}

const config = {
  polygon: { investments: ['0xcf152E9f60E197A44FAdce961c6B822Dcb6c9dcc'], debts: [], token: ADDRESSES.polygon.USDC },
  base: { investments: ['0xF36d1AdDA798Ea9340069207806dcBB137d31212'], debts: [], token: ADDRESSES.base.USDC }
}

Object.keys(config).forEach(chain => {
  const { investments, debts, token } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      return api.sumTokens({ owners: investments.concat(debts), tokens: [token] })
    },
    borrowed: async (api) => {
      const nftCount = (await api.multiCall({ abi: 'uint256:_tokenIdCounter', calls: investments, permitFailure: true })).map(i => i ?? 0)
      const amount = (await api.multiCall({ abi: 'uint256:amountPerNft', calls: investments, permitFailure: true })).map(i => i ?? 0)
      api.add(token, nftCount.map((v, i) => v * amount[i]))

      const bals = (await api.multiCall({ abi: 'uint256:amount', calls: debts, permitFailure: true })).map(i => i ?? 0)
      api.add(token, bals)
      return api.getBalances()
    },
  }
})
