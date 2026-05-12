const { get } = require('../helper/http')

const API_URL = 'https://api.arkonix.xyz/public/vaults'

const CHAINS = {
  1: 'ethereum',
  10: 'optimism',
  56: 'bsc',
  42161: 'arbitrum',
  43114: 'avax',
  999: 'hyperliquid',
}

async function getVaultsByChain() {
  const { share_classes } = await get(API_URL)
  const byChain = {}
  for (const sc of share_classes || []) {
    for (const v of sc.vaults || []) {
      const chain = CHAINS[v.chain_id]
      if (!chain || !v.vault_address) continue
      if (!byChain[chain]) byChain[chain] = []
      byChain[chain].push(v.vault_address)
    }
  }
  return byChain
}

const tvl = async (api) => {
  const vaultsByChain = await getVaultsByChain()
  const vaults = vaultsByChain[api.chain] || []
  if (!vaults.length) return
  await api.erc4626Sum({
    calls: vaults,
    tokenAbi: 'address:asset',
    balanceAbi: 'uint256:totalAssets',
    permitFailure: true,
  })
}

module.exports = {
  methodology:
    'TVL is the sum of totalAssets() across all live Arkonix ERC-7540 vaults, priced by each vault\'s underlying deposit asset. Vault list is sourced from the public Arkonix API.',
}

Object.keys(CHAINS).forEach((id) => {
  module.exports[CHAINS[id]] = { tvl }
})
