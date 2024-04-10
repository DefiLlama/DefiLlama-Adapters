const ADDRESSES = require('../helper/coreAssets.json')
module.exports = {
  methodology: "Sums the amount of funded real-world assets on ALTA Finance as borrowed. Tokens left in the countract are counted towards tvl",
}

const config = {
  polygon: { investments: ['0xcf152E9f60E197A44FAdce961c6B822Dcb6c9dcc'], debts: ['0xE92F580C930dd24aACB38Ab0EA18F6c1dEf31369','0x64D6583b81716a4d141f07E264805CaCd3f484bB'], token: ADDRESSES.polygon.USDC },
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
