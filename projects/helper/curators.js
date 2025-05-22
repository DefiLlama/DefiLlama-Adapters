const ABI = {
  ERC4626: {
    asset: 'address:asset',
    totalAssets: 'uint256:totalAssets',
  },
  aera: {
    assetRegistry: 'address:assetRegistry',
    numeraireToken: 'address:numeraireToken',
    value: 'uint256:value',
  },
}

async function getCuratorTvlErc4626(api, vaults) {
  const assets =  await api.multiCall({ abi: ABI.ERC4626.asset, calls: vaults, permitFailure: true, excludeFailed: true, })
  const totalAssets = await api.multiCall({ abi: ABI.ERC4626.totalAssets, calls: vaults, permitFailure: true, excludeFailed: true, })

  return api.add(assets, totalAssets)
}

async function getCuratorTvlAeraVault(api, vaults) {
  const assetRegistries =  await api.multiCall({ abi: ABI.aera.assetRegistry, calls: vaults, permitFailure: true })
  const existedVaults = []
  const existedRegistries = []
  for (let i = 0; i < vaults.length; i++) {
    if (assetRegistries[i]) {
      existedVaults.push(vaults[i])
      existedRegistries.push(assetRegistries[i])
    }
  }
  const assets =  await api.multiCall({ abi: ABI.aera.numeraireToken, calls: existedRegistries })
  const values = await api.multiCall({ abi: ABI.aera.value, calls: existedVaults, permitFailure: true })
  return api.add(assets, values.map(v => v || 0))
}

async function getCuratorTvl(api, vaults) {
  if (vaults.morpho) {
    await getCuratorTvlErc4626(api, vaults.morpho) 
  }
  if (vaults.euler) {
    await getCuratorTvlErc4626(api, vaults.euler)
  }
  if (vaults.aera) {
    await getCuratorTvlAeraVault(api, vaults.aera)
  }
}

function getCuratorExport(configs) {
  const exportObjects = {
    // these tvl are double count
    doublecounted: true,

    // methodology
    methodology: configs.methodology ? configs.methodology : 'Count all deposited assets in curated vaults.',
  }

  for (const [chain, vaultConfigs] of Object.entries(configs.blockchains)) {
    exportObjects[chain] = {
      tvl: async (api) => {
        return getCuratorTvl(api, vaultConfigs)
      }
    }
  }

  return exportObjects
}

module.exports = {
  getCuratorTvl,
  getCuratorExport,
}
