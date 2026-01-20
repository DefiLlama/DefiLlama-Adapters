const { queryContract } = require('../helper/chain/cosmos')
const { getConfig } = require('../helper/cache')

async function tvlOsmosis(api) {
  const data = await getConfig('quasar-vaults', 'https://api.quasar.fi/vaults')
  const vaults = data.filter(i => i.chainId === 'osmosis-1').map(i => i.address)
  for (const vault of vaults) {
    const total_assets = await queryContract({ chain: 'osmosis', contract: vault, data: { total_assets: {} }, })
    Object.values(total_assets).forEach(({ denom, amount }) => api.add(denom, amount))
  }
  return api.getBalances()
}

async function tvlEthereum(api) {
  const data = await getConfig('quasar-vaults', 'https://api.quasar.fi/vaults')
  const vaults = data.filter(i => i.chainId === 1).map(i => i.address)
  const tvlRes = await api.multiCall({ abi: 'function underlyingTvl() view returns (address[] tokens, uint256[] bals)', calls: vaults })
  tvlRes.forEach(({ tokens, bals }) => {
    api.add(tokens, bals)
  })
}

module.exports = {
  timetravel: false,
  methodology: 'Total TVL on vaults',
  osmosis: {
    tvl: tvlOsmosis,
  },
  ethereum: {
    tvl: tvlEthereum
  }
}
