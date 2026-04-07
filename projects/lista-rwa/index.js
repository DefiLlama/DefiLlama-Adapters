const { getConfig } = require('../helper/cache')
const { getAddress } = require('ethers')

const abi = {
  asset: "address:asset",
  totalAssets: "uint256:totalAssets",
  getVaultInfo: "function getVaultInfo() view returns (uint256 maxCapacity, uint256 totalDeposited, uint256 stakingDays)",
}

async function tvl(api) {
  const { data: { list: products } } = await getConfig('lista/rwa', 'https://api.lista.org/api/rwa/product/list')

  // Separate Centrifuge and Dowsure products
  const centrifugeProducts = products.filter(p => p.group === 'centrifuge')
  const dowsureProducts = products.filter(p => p.group === 'dowsure')

  // Handle Centrifuge products (existing logic)
  if (centrifugeProducts.length > 0) {
    const centrifugeContracts = centrifugeProducts.map(p => getAddress(p.contract))
    const assets = await api.multiCall({ calls: centrifugeContracts, abi: abi.asset })
    const totalAssets = await api.multiCall({ calls: centrifugeContracts, abi: abi.totalAssets })

    for (let i = 0; i < centrifugeContracts.length; i++) {
      api.add(assets[i], totalAssets[i])
    }
  }

  // Handle Dowsure products (new logic for getVaultInfo)
  if (dowsureProducts.length > 0) {
    const dowsureContracts = dowsureProducts.map(p => getAddress(p.contract))
    const vaultInfos = await api.multiCall({ calls: dowsureContracts, abi: abi.getVaultInfo })

    for (let i = 0; i < dowsureContracts.length; i++) {
      const totalDeposited = vaultInfos[i].totalDeposited
      const product = dowsureProducts[i]

      // Dowsure vaults support multiple assets, use the assets from API response
      if (product.assets && product.assets.length > 0) {
        // For multi-asset vaults, distribute TVL across supported assets
        // Using totalDeposited as the TVL (in USD terms from the vault)
        // Default to USDT as the primary asset
        const primaryAsset = product.assets[0].address
        api.add(getAddress(primaryAsset), totalDeposited)
      }
    }
  }
}

module.exports = {
  methodology: "TVL is calculated by summing the totalAssets of Centrifuge RWA products and totalDeposited from Dowsure vault products",
  bsc: {
    tvl,
  },
}

