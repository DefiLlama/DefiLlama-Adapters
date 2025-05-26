const { getLogs2 } = require("../../helper/cache/getLogs")
const { ABI, MorphoConfigs, EulerConfigs } = require('./configs')

function isOwner(owner, owners) {
  for (const item of owners) {
    if (String(item).toLowerCase() === String(owner).toLowerCase()) {
      return true
    }
  }
  return false
}

async function getMorphoVaults(api, owners) {
  let allVaults = []
  for (const factory of MorphoConfigs[api.chain].vaultFactories) {
    const vaultOfOwners = (
      await getLogs2({
        api,
        eventAbi: ABI.morpho.CreateMetaMorphoEvent,
        target: factory.address,
        fromBlock: factory.fromBlock,
      })
    ).filter(log => isOwner(log.initialOwner, owners)).map((log) => log.metaMorpho)
    allVaults = allVaults.concat(vaultOfOwners)
  }
  return allVaults
}

async function getEulerVaults(api, owners) {
  let allVaults = []
  for (const factory of EulerConfigs[api.chain].vaultFactories) {
    const getProxyListLength = await api.call({
      abi: ABI.euler.getProxyListLength,
      target: factory,
    });
    const lists = []
    for (let i = 0; i < Number(getProxyListLength); i++) {
      lists.push(i);
    }
    const proxyAddresses = await api.multiCall({
      abi: ABI.euler.proxyList,
      calls: lists.map(index => {
        return {
          target: factory,
          params: [index],
        }
      }),
    })
    const proxyCreators = await api.multiCall({
      abi: ABI.euler.creator,
      calls: proxyAddresses,
    });
    for (let i = 0; i < proxyAddresses.length; i++) {
      if (isOwner(proxyCreators[i], owners)) {
        allVaults.push(proxyAddresses[i])
      }
    }
  }
  return allVaults
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
  // dynamic get vaults list from event logs
  if (vaults.morphoVaultOwners) {
    if (vaults.morpho) {
      vaults.morpho = vaults.morpho.concat(await getMorphoVaults(api, vaults.morphoVaultOwners))
    } else {
      vaults.morpho = await getMorphoVaults(api, vaults.morphoVaultOwners)
    }
  }
  if (vaults.eulerVaultOwners) {
    if (vaults.euler) {
    vaults.euler = vaults.euler.concat(await getEulerVaults(api, vaults.eulerVaultOwners))
    } else {
      vaults.euler = await getEulerVaults(api, vaults.eulerVaultOwners)
    }
  }

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
