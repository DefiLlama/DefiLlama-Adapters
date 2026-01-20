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
  const safeBlock = (await api.getBlock()) - 200
  
  // Query v1 vaults
  if (MorphoConfigs[api.chain]?.vaultFactories) {
    for (const factory of MorphoConfigs[api.chain].vaultFactories) {
      const vaultOfOwners = (
        await getLogs2({
          api,
          eventAbi: ABI.morpho.CreateMetaMorphoEvent,
          target: factory.address,
          fromBlock: factory.fromBlock,
          toBlock: safeBlock
        })
      ).filter(log => isOwner(log.initialOwner, owners)).map((log) => log.metaMorpho)
      allVaults = allVaults.concat(vaultOfOwners)
    }
  }

  // Query v2 vaults
  if (MorphoConfigs[api.chain]?.vaultFactoriesV2) {
    for (const factory of MorphoConfigs[api.chain].vaultFactoriesV2) {
      const vaultOfOwners = (
        await getLogs2({
          api,
          eventAbi: ABI.morpho.CreateVaultV2Event,
          target: factory.address,
          fromBlock: factory.fromBlock,
          toBlock: safeBlock
        })
      ).filter(log => isOwner(log.owner, owners)).map((log) => log.newVaultV2)
      allVaults = allVaults.concat(vaultOfOwners)
    }
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
  if (!vaults || vaults.length === 0) return

  // Get assets and totalAssets for all vaults
  const assets = await api.multiCall({ abi: ABI.ERC4626.asset, calls: vaults, permitFailure: true })
  const totalAssets = await api.multiCall({ abi: ABI.ERC4626.totalAssets, calls: vaults, permitFailure: true })

  // Check which vaults are Morpho v2 (have liquidityAdapter function)
  const liquidityAdapters = await api.multiCall({
    abi: ABI.morphoV2.liquidityAdapter,
    calls: vaults,
    permitFailure: true,
  })

  // Separate vaults into Morpho v2 and others
  const v2Vaults = []
  const otherVaults = []
  const vaultMap = new Map() // vault address -> vaultInfo

  for (let i = 0; i < vaults.length; i++) {
    if (!assets[i] || !totalAssets[i]) continue

    const vaultInfo = {
      vault: vaults[i],
      asset: assets[i],
      totalAssets: BigInt(totalAssets[i] || 0),
      liquidityAdapter: liquidityAdapters[i],
    }

    vaultMap.set(vaults[i].toLowerCase(), vaultInfo)

    if (liquidityAdapters[i]) {
      v2Vaults.push(vaultInfo)
    } else {
      otherVaults.push(vaultInfo)
    }
  }

  if (v2Vaults.length === 0) {
    // No v2 vaults, process all normally
    for (const vaultInfo of otherVaults) {
      api.add(vaultInfo.asset, vaultInfo.totalAssets)
    }
    return
  }

  // For each v2 vault, get the v1 vault address via the adapter
  const v1VaultAddresses = await api.multiCall({
    abi: ABI.morphoAdapter.morphoVaultV1,
    calls: v2Vaults.map(v => v.liquidityAdapter),
    permitFailure: true,
  })

  // Track which v1 vaults are found via v2 adapters (to avoid double-counting)
  const v1VaultsFromV2 = new Set()
  for (const v1Address of v1VaultAddresses) {
    if (v1Address) {
      v1VaultsFromV2.add(v1Address.toLowerCase())
    }
  }

  // Process non-Morpho vaults, but skip v1 vaults that will be handled via v2 de-duplication
  for (const vaultInfo of otherVaults) {
    if (!v1VaultsFromV2.has(vaultInfo.vault.toLowerCase())) {
      api.add(vaultInfo.asset, vaultInfo.totalAssets)
    }
  }

  // Build morpho pairs: v2 vault -> v1 vault data
  const morphoPairs = []
  const v1AddressesToFetch = []

  for (let i = 0; i < v2Vaults.length; i++) {
    const v2 = v2Vaults[i]
    const v1Address = v1VaultAddresses[i]

    if (!v1Address) {
      // If we can't get v1 address, just process v2 normally
      api.add(v2.asset, v2.totalAssets)
      continue
    }

    const v1InList = vaultMap.get(v1Address.toLowerCase())
    if (v1InList) {
      // v1 is in the original list, use its data
      const v1 = {
        vault: v1Address,
        asset: v1InList.asset,
        totalAssets: v1InList.totalAssets,
      }
      morphoPairs.push({ v1, v2 })
    } else {
      // v1 is not in the list, need to fetch it
      v1AddressesToFetch.push({ v1Address, v2Index: i })
    }
  }

  // Fetch data for v1 vaults not in the original list
  if (v1AddressesToFetch.length > 0) {
    const fetchedAssets = await api.multiCall({
      abi: ABI.ERC4626.asset,
      calls: v1AddressesToFetch.map(v => v.v1Address),
      permitFailure: true,
    })
    const fetchedTotalAssets = await api.multiCall({
      abi: ABI.ERC4626.totalAssets,
      calls: v1AddressesToFetch.map(v => v.v1Address),
      permitFailure: true,
    })

    for (let j = 0; j < v1AddressesToFetch.length; j++) {
      const { v1Address, v2Index } = v1AddressesToFetch[j]
      const v2 = v2Vaults[v2Index]

      if (!fetchedAssets[j] || !fetchedTotalAssets[j]) {
        // If we can't get v1 data, just process v2 normally
        api.add(v2.asset, v2.totalAssets)
        continue
      }

      const v1 = {
        vault: v1Address,
        asset: fetchedAssets[j],
        totalAssets: BigInt(fetchedTotalAssets[j] || 0),
      }
      morphoPairs.push({ v1, v2 })
    }
  }

  // Process Morpho pairs with de-duplication
  for (const { v1, v2 } of morphoPairs) {
    let v2DepositsInV1 = 0n

    if (v2.liquidityAdapter) {
      // Get v2's deposits in v1 using the adapter address
      const v2AdapterSharesInV1 = await api.call({
        abi: ABI.ERC4626.balanceOf,
        target: v1.vault,
        params: [v2.liquidityAdapter],
        permitFailure: true,
      })

      if (v2AdapterSharesInV1 && BigInt(v2AdapterSharesInV1) > 0n) {
        // Convert v1 shares held by v2 adapter to underlying assets
        const v2AssetsInV1 = await api.call({
          abi: ABI.ERC4626.convertToAssets,
          target: v1.vault,
          params: [v2AdapterSharesInV1],
          permitFailure: true,
        })
        if (v2AssetsInV1) {
          v2DepositsInV1 = BigInt(v2AssetsInV1)
        }
      }
    }

    // Unique TVL = V1 + V2 - v2_deposits_in_v1
    const uniqueTvl = v1.totalAssets + v2.totalAssets - v2DepositsInV1
    api.add(v1.asset, uniqueTvl)
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

  // Combine all ERC-4626 vaults (morpho, erc4626, etc.) into a single array
  // This ensures de-duplication works across all ERC-4626 vaults regardless of which array they come from
  const allErc4626Vaults = [
    ...allVaults.morpho,
    ...(vaults.erc4626 || []),
    ...(vaults.mellow || []),
    ...(vaults.turtleclub_erc4626 || []),
  ]

  // Process all ERC-4626 vaults together for proper de-duplication
  if (allErc4626Vaults.length > 0) {
    await getCuratorTvlErc4626(api, allErc4626Vaults)
  }

  // Process other vault types separately
  await getCuratorTvlErc4626(api, allVaults.euler)
  await getCuratorTvlErc4626(api, allVaults.silo)

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

  // symiotic.fi
  if (vaults.symbiotic) {
    await getCuratorTvlSymbioticVault(api, vaults.symbiotic)
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