const { normalizeAddress } = require("./tokenMapping")
const { sumTokens2 } = require("./unwrapLPs")

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
  const assets =  await api.multiCall({ abi: ABI.ERC4626.asset, calls: vaults })
  const totalAssets = await api.multiCall({ abi: ABI.ERC4626.totalAssets, calls: vaults })

  return vaults.map((vault, index) => {
    return {
      vault: vault,
      token: assets[index],
      balance: totalAssets[index],
    }
  })
}

async function getCuratorTvlAeraVault(api, vaults) {
  const assetRegistries =  await api.multiCall({ abi: ABI.aera.assetRegistry, calls: vaults })
  const assets =  await api.multiCall({ abi: ABI.aera.numeraireToken, calls: assetRegistries })
  const values = await api.multiCall({ abi: ABI.aera.value, calls: vaults })

  return vaults.map((vault, index) => {
    return {
      vault: vault,
      token: assets[index],
      balance: values[index],
    }
  })
}

async function getCuratorTvl(api, vaults) {
  let allVaults = []
  if (vaults.morpho) {
    allVaults = allVaults.concat((await getCuratorTvlErc4626(api, vaults.morpho)))
  }
  if (vaults.euler) {
    allVaults = allVaults.concat((await getCuratorTvlErc4626(api, vaults.euler)))
  }
  if (vaults.aera) {
    allVaults = allVaults.concat((await getCuratorTvlAeraVault(api, vaults.aera)))
  }

  const balances = {}
  for (const vaultBalance of allVaults) {
    const token = `${api.chain}:${normalizeAddress(vaultBalance.token)}`
    if (!balances[token]) {
      balances[token] = 0
    }
    balances[token] += Number(vaultBalance.balance)
  }

  return balances
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
