const { getConfig } = require('../helper/cache')
const { getAddress } = require('ethers')

const abi = {
  asset: "address:asset",
  totalAssets: "uint256:totalAssets",
  getVaultInfo: "function getVaultInfo() view returns (uint256 maxCapacity, uint256 totalDeposited, uint256 stakingDays)",
}

async function tvl(api) {
  const { data: { list: allProducts } } = await getConfig('lista/rwa', 'https://api.lista.org/api/rwa/product/list')

  // Backend returns mixed-chain products in one payload; filter to the chain being indexed.
  const products = allProducts.filter(p => p.chain === api.chain)

  // Pool-like products share the same accounting shape — Centrifuge's RWAEarnPool
  // and XAUE's XAUTStaking both expose asset() + totalAssets() in underlying units.
  const poolProducts = products.filter(p => p.group === 'centrifuge' || p.group === 'xaue')
  if (poolProducts.length > 0) {
    const poolContracts = poolProducts.map(p => getAddress(p.contract))
    const assets = await api.multiCall({ calls: poolContracts, abi: abi.asset })
    const totalAssets = await api.multiCall({ calls: poolContracts, abi: abi.totalAssets })

    for (let i = 0; i < poolContracts.length; i++) {
      api.add(assets[i], totalAssets[i])
    }
  }

  // Handle Dowsure products (getVaultInfo path)
  const dowsureProducts = products.filter(p => p.group === 'dowsure')
  if (dowsureProducts.length > 0) {
    const dowsureContracts = dowsureProducts.map(p => getAddress(p.contract))
    const vaultInfos = await api.multiCall({ calls: dowsureContracts, abi: abi.getVaultInfo })

    for (let i = 0; i < dowsureContracts.length; i++) {
      const totalDeposited = vaultInfos[i].totalDeposited
      const product = dowsureProducts[i]

      if (!product.assets || product.assets.length === 0) {
        throw new Error(`Dowsure product ${product.contract} has no assets defined`)
      }

      // Dowsure vaults pool multiple stablecoins (e.g., USDT/USDC) into a single vault.
      // The totalDeposited represents the combined TVL. Since we cannot determine
      // the exact breakdown per asset from the vault contract, we attribute the
      // entire TVL to the primary asset (first in the list) to avoid double-counting.
      const primaryAsset = product.assets[0].address
      api.add(getAddress(primaryAsset), totalDeposited)
    }
  }
}

module.exports = {
  methodology: "TVL is calculated by summing totalAssets of pool-like RWA products (Centrifuge on BSC, slisXAUE/XAUTStaking on Ethereum) and totalDeposited from Dowsure vault products on BSC. For Dowsure multi-asset vaults, the entire TVL is attributed to the primary asset (first in metadata) since per-asset breakdown is not available on-chain.",
  bsc: {
    tvl,
  },
  ethereum: {
    tvl,
  },
}
