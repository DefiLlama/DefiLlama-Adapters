const { getTokenSupplies } = require('../helper/solana')

const CONFIG = {
  avax: ['0x5954fF4099ac47C4d6D098A9216f3278BB8C9506'],
}

const SOLANA = ['5VzwKkvynPJzcgwhBe7ESEyNgqMbo15yBu7Sehssd9ED']

const tvl = async (api) => {
  const tokens = CONFIG[api.chain]
  const supplies = await api.multiCall({ calls: tokens, abi: 'erc20:totalSupply' })
  api.add(tokens, supplies)
}

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl }
})

module.exports.solana = {
  tvl: async (api) => {
    const res = await getTokenSupplies(SOLANA, api.chain)
    const supply = res[SOLANA[0]]
    api.add(SOLANA[0], supply)
  }
}
