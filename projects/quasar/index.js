const { queryContract } = require('../helper/chain/cosmos')
const { getConfig } = require('../helper/cache')

async function tvl(api) {
  const data = await getConfig('quasar-vaults', 'https://api.quasar.fi/vaults')
  const vaults = data.filter(i => i.chainId === 'osmosis-1').map(i => i.address)
  for (const vault of vaults) {
    const total_assets = await queryContract({ chain: 'osmosis', contract: vault, data: { total_assets: {} }, })
    Object.values(total_assets).forEach(({ denom, amount }) => api.add(denom, amount))
  }
  return api.getBalances()
}

module.exports = {
  timetravel: false,
  methodology: 'Total TVL on vaults',
  osmosis: {
    tvl,
  },
}