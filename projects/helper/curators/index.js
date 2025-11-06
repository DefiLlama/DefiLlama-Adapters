const { getLogs2 } = require("../../helper/cache/getLogs")
const { ABI, MorphoConfigs, EulerConfigs, SiloConfigs, VesuConfigs } = require('./configs')
const { multiCall } = require('../chain/starknet')

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
      permitFailure: true,
    });
    if (getProxyListLength) {
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
  }
  return allVaults
}

async function getSiloVaults(api, owners) {
  let allVaults = []
  for (const factory of SiloConfigs[api.chain].vaultFactories) {
    const siloVaults = (
      await getLogs2({
        api,
        eventAbi: ABI.silo.CreateSiloVaultEvent,
        target: factory.address,
        fromBlock: factory.fromBlock,
      })
    ).map((log) => log.vault)
    const siloVaultsOwners = await api.multiCall({
      abi: ABI.owner,
      calls: siloVaults,
    })
    for (let i = 0; i < siloVaultsOwners.length; i++) {
      if (isOwner(siloVaultsOwners[i], owners)) {
        allVaults.push(siloVaults[i])
      }
    }
  }
  return allVaults
}

async function getCuratorTvlErc4626(api, vaults) {
  const assets =  await api.multiCall({ abi: ABI.ERC4626.asset, calls: vaults, permitFailure: true, })
  const totalAssets = await api.multiCall({ abi: ABI.ERC4626.totalAssets, calls: vaults, permitFailure: true, })
  for (let i = 0; i < assets.length; i++) {
    if (!assets[i] || !totalAssets[i]) continue;
    api.add(assets[i], totalAssets[i]);
  }
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
  api.add(assets, values.map(v => v || 0))
}

async function getCuratorTvlVesuVault(api, vaults) {
  const poolAssets = vaults.map((pool_id) => VesuConfigs.assets.map((asset) => ({ pool_id, asset }))).flat();
  const calls = poolAssets.map(({ pool_id, asset }) => ({ target: VesuConfigs.singleton, params: [pool_id, asset] }))
  const assetStates = await multiCall({ calls, abi: VesuConfigs.abi.asset_config_unsafe, allAbi: VesuConfigs.allAbi });
  assetStates.forEach((res, index) => {
    const { reserve } = res['0']
    api.add(poolAssets[index].asset, reserve);
  });
}

async function getCuratorTvlBoringVault(api, vaults) {
  let filterHookVaults = []
  const hooks =  await api.multiCall({ abi: ABI.boringVault.hook, calls: vaults, permitFailure: true })
  for (let i = 0; i < vaults.length; i++) {
    if (hooks[i]) {
      filterHookVaults.push({
        vault: vaults[i],
        hook: hooks[i],
      })
    }
  }

  let filterAccountantVaults = []
  const accountants = await api.multiCall({ abi: ABI.boringVault.accountant, calls: filterHookVaults.map(filterVault => filterVault.hook), permitFailure: true })
  for (let i = 0; i < filterHookVaults.length; i++) {
    if (accountants[i]) {
      filterAccountantVaults.push({
        vault: filterHookVaults[i].vault,
        hook: filterHookVaults[i].hook,
        accountant: accountants[i],
      })
    }
  }
  const assets = await api.multiCall({ abi: ABI.boringVault.base, calls: filterAccountantVaults.map(filterVault => filterVault.accountant) })
  const rates = await api.multiCall({ abi: ABI.boringVault.getRate, calls: filterAccountantVaults.map(filterVault => filterVault.accountant) })
  const supplies = await api.multiCall({ abi: ABI.totalSupply, calls: filterAccountantVaults.map(filterVault => filterVault.vault) })
  const decimals = await api.multiCall({ abi: ABI.decimals, calls: filterAccountantVaults.map(filterVault => filterVault.accountant) })
  for (let i = 0; i < assets.length; i++) {
    if (assets[i]) {
      api.add(assets[i], rates[i] * supplies[i] / 10**(Number(decimals[i])))
    }
  }
}

async function getCuratorTvlSymbioticVault(api, vaults) {
  const assets =  await api.multiCall({ abi: ABI.symbiotic.collateral, calls: vaults, permitFailure: true })
  const existedVaults = []
  for (let i = 0; i < vaults.length; i++) {
    if (assets[i]) {
      existedVaults.push({
        vault: vaults[i],
        asset: assets[i],
      })
    }
  }
  const totalStakes = await api.multiCall({ abi: ABI.symbiotic.totalStake, calls: existedVaults.map(vault => vault.vault), permitFailure: true })
  api.add(assets, totalStakes.map(v => v || 0))
}

async function getNested4626Vaults(api, vaults) {
  const vaultAsset = await api.multiCall({ abi: ABI.ERC4626.asset, calls: vaults, permitFailure: true })
  const nestedVaultAsset = await api.multiCall({ abi: ABI.ERC4626.asset, calls: vaultAsset, permitFailure: true })
  const totalAssets = await api.multiCall({ abi: ABI.ERC4626.totalAssets, calls: vaults, permitFailure: true })
  for (let i = 0; i < vaults.length; i++) {
    const resolvedAsset = nestedVaultAsset[i] || vaultAsset[i]
    if (!resolvedAsset) continue
    api.add(resolvedAsset, totalAssets[i])
  }
}

async function getCuratorTvl(api, vaults) {
  const allVaults = {
    morpho: vaults.morpho ? vaults.morpho : [],
    euler: vaults.euler ? vaults.euler : [],
    silo: vaults.silo ? vaults.silo : [],
  }

  // dynamic get vaults list from event logs
  if (vaults.morphoVaultOwners) {
    allVaults.morpho = allVaults.morpho.concat(await getMorphoVaults(api, vaults.morphoVaultOwners))
  }
  if (vaults.eulerVaultOwners) {
    allVaults.euler = allVaults.euler.concat(await getEulerVaults(api, vaults.eulerVaultOwners))
  }
  if (vaults.siloVaultOwners) {
    allVaults.silo = allVaults.silo.concat(await getSiloVaults(api, vaults.siloVaultOwners))
  }

  await getCuratorTvlErc4626(api, allVaults.morpho)
  await getCuratorTvlErc4626(api, allVaults.euler)
  await getCuratorTvlErc4626(api, allVaults.silo)

  // mellow.finance vaults
  if (vaults.mellow) {
    await getCuratorTvlErc4626(api, vaults.mellow)
  }

  // aera.finance vaults
  if (vaults.aera) {
    await getCuratorTvlAeraVault(api, vaults.aera)
  }

  // vesu.xyz vaults
  if (vaults.vesu) {
    await getCuratorTvlVesuVault(api, vaults.vesu)
  }

  // turtle.club vaults - boring vaults
  if (vaults.turtleclub) {
    await getCuratorTvlBoringVault(api, vaults.turtleclub)
  }

  // turtle.club vaults - ERC626 vaults
  if (vaults.turtleclub_erc4626) {
    await getCuratorTvlErc4626(api, vaults.turtleclub_erc4626)
  }

  // symiotic.fi
  if (vaults.symbiotic) {
    await getCuratorTvlSymbioticVault(api, vaults.symbiotic)
  }

  // custom ERC4626 vaults {
  if (vaults.erc4626) {
    await getCuratorTvlErc4626(api, vaults.erc4626)
  }

  // nested 4626 vaults
  if (vaults.nestedVaults) {
    await getNested4626Vaults(api, vaults.nestedVaults)
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