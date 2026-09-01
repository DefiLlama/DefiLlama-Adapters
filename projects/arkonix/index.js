const { getConfig } = require('../helper/cache')

const API_URL = 'https://api.arkonix.xyz/public/vaults'

async function getVaults(chainId) {
  const { share_classes } = await getConfig('arkonix', API_URL)
  const vaults = new Set()
  for (const sc of share_classes || []) {
    for (const v of sc.vaults || []) {
      if (v.chain_id === chainId && v.vault_address)
        vaults.add(v.vault_address.toLowerCase())
    }
  }
  return [...vaults]
}

const tvl = async (api) => {
  const vaults = await getVaults(api.chainId)
  if (!vaults.length) return
  await api.erc4626Sum2({ calls: vaults })
}

module.exports = {
  methodology:
    'TVL is the sum of totalAssets() across all live Arkonix ERC-7540 vaults, priced by each vault\'s underlying deposit asset. Vault list is sourced from the public Arkonix API.',
  ethereum: { tvl },
  arbitrum: { tvl }
}
