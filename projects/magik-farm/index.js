const { getConfig } = require('../helper/cache')

const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  aurora: 'aurora',
  arbitrum: 'arbitrum',
  avax: 'avalanche',
  bsc: 'bsc',
  celo: 'celo',
  cronos: 'cronos',
  dogechain: 'doge',
  fantom: 'fantom',
  polygon: 'polygon',
  harmony: 'harmony',
  heco: 'heco',
  moonriver: 'moonriver',
}

Object.keys(config).forEach(chain => {
  const key = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const data = await getConfig('magik-farm/'+chain, `https://raw.githubusercontent.com/magikfinance/magik-farm-fe-master/main/src/features/configure/vault/${key}_pools.js`)
      const vaults = data.split('\n').filter(line => line.includes('earnedTokenAddress')).map(line => line.split(':')[1].trim().replace(/['",]/g, ''))
      const tokens = await api.multiCall({ calls: vaults, abi: 'address:want'})
      const bals = await api.multiCall({ calls: vaults, abi: 'uint256:balance'})
      api.addTokens(tokens, bals)
      return sumTokens2({ api, resolveLP: true, })
    }
  }
})
