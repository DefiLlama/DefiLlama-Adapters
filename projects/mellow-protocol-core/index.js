const BigNumber = require('bignumber.js');
const ADDRESSES = require('../helper/coreAssets.json')
const { getConfig } = require('../helper/cache');

const abi = {
  collect: 'function collect(address,address,(address,uint256,uint256)) view returns ((address,address,address[],uint8[],uint256[],(address,address,bool,bool,bool,uint256,uint256[])[],uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,(address,address,uint256,uint256,uint256,uint256)[],(address,address,uint256,uint256,uint256,uint256)[],uint256,uint256))',
  shareManager: 'function shareManager() view returns (address)',
  subvaults: 'function subvaults() view returns (uint256)',
  subvaultAt: 'function subvaultAt(uint256) view returns (address)',
  totalAssets: 'function totalAssets() view returns (uint256)',
  totalSupply: 'function totalSupply() view returns (uint256)',
  balanceOf: 'function balanceOf(address) view returns (uint256)',
  asset: 'function asset() view returns (address)',
}

let _vaultsApiResponse

const getDoubleCountedShares = async ({api, coreVaults, dvvVaults, coreVaultsResults}) => {
  const shareManagerByVault = {}
  const coreVaultShareManagers = await api.multiCall({ calls: coreVaults.map(vault => vault.address), abi: abi.shareManager, permitFailure: true })
  for (let i = 0; i < coreVaults.length; i++) {
    shareManagerByVault[coreVaults[i].address] = coreVaultShareManagers[i]
  }
  for (let i = 0; i < dvvVaults.length; i++) {
    shareManagerByVault[dvvVaults[i].address] = dvvVaults[i].address
  }

  // Exclude double counting of shares from other vaults allocating to this vault (in subvaults)
  const subvaultsByVault = await api.fetchList({ lengthAbi: abi.subvaults, itemAbi: abi.subvaultAt, targets: coreVaults.map(vault => vault.address), groupedByInput: true })

  const vaultsOuterSubvaults = {}
  for (let i = 0; i < subvaultsByVault.length; i++) {
    const vault = coreVaults[i]
    vaultsOuterSubvaults[vault.address] = []
    for (let j = 0; j < subvaultsByVault.length; j++) {
      if (i === j) continue
      vaultsOuterSubvaults[vault.address].push(...(subvaultsByVault[j] || []))
    }
  }
  for (let i = 0; i < dvvVaults.length; i++) {
    const vault = dvvVaults[i]
    vaultsOuterSubvaults[vault.address] = []
    for (let j = 0; j < subvaultsByVault.length; j++) {
      vaultsOuterSubvaults[vault.address].push(...(subvaultsByVault[j] || []))
    }
  }

  const vaultBalances = await api.multiCall({
    calls: Object.entries(vaultsOuterSubvaults).flatMap(([vault, subvaults]) =>
      subvaults.map((subvault) => ({ target: shareManagerByVault[vault], params: [subvault] }))
    ),
    abi: abi.balanceOf,
    permitFailure: true,
  })

  const doubleCountedSharesByVault = {}

  let vaultBalanceIdx = 0
  for (const [vault, subvaults] of Object.entries(vaultsOuterSubvaults)) {
    for (const subvault of subvaults) {
      const balanceResult = vaultBalances[vaultBalanceIdx++]
      if (!balanceResult) continue
      const balance = BigNumber(balanceResult)
      if (balance.eq(0)) continue
      if (doubleCountedSharesByVault[vault] == null) {
        doubleCountedSharesByVault[vault] = balance
      } else {
        doubleCountedSharesByVault[vault] = doubleCountedSharesByVault[vault].plus(balance)
      }
    }
  }

  coreVaultsResults.forEach((result) => {
    if (!result || !Array.isArray(result)) return
    const vaultAddress = result[0]
    const queues = result[5]
    // Exclude double counting of other vaults deposited into this vault
    for (const queue of queues) {
      const queueAsset = queue[1]
      const isDepositQueue = queue[2]
      const pendingValue = BigNumber(queue[5])
      if (!isDepositQueue || pendingValue.eq(0)) continue
      for (const vault in shareManagerByVault) {
        // exclude own vault share manager
        if (vault === vaultAddress) continue
        const shareManager = shareManagerByVault[vault]
        if (queueAsset !== shareManager) continue
        // queueAsset is another vault address
        if (doubleCountedSharesByVault[queueAsset] == null) {
          doubleCountedSharesByVault[queueAsset] = pendingValue
        } else {
          doubleCountedSharesByVault[queueAsset] = doubleCountedSharesByVault[queueAsset].plus(pendingValue)
        }
      }
    }
  })

  return doubleCountedSharesByVault
}

const tvl = async (api) => {
  const chainId = Number(api.chainId)
  if (!_vaultsApiResponse) _vaultsApiResponse = getConfig('mellow-v2', 'https://api.mellow.finance/v1/vaults')
  const vaultsApiResponse = await _vaultsApiResponse;

  const vaultsOnChain = vaultsApiResponse.filter(v => v && Number(v.chain_id) === chainId)
  const coreVaults = vaultsOnChain.filter(v => v.type === 'core-vault')
  const dvvVaults  = vaultsOnChain.filter(v => v.type === 'dvv-vault')

  const coreVaultsResults = await api.multiCall({ calls: coreVaults.map((vault) => ({ target: vault.collector, params: [ADDRESSES.null, vault.address, [vault.base_token.address, 0, 0]] })), abi: abi.collect, permitFailure: true })

  const doubleCountedSharesByVault = await getDoubleCountedShares({api, coreVaults, dvvVaults, coreVaultsResults})

  coreVaultsResults.forEach((result) => {
    if (!result || !Array.isArray(result)) return
    const vaultAddress = result[0]
    const baseAsset = result[1]
    const totalSupply = BigNumber(result[6])
    let totalBaseAsset = BigNumber(result[9])
    if (!baseAsset || !totalBaseAsset || totalSupply.eq(0)) return
    const doubleCountedShares = doubleCountedSharesByVault[vaultAddress] || BigNumber(0)
    if (doubleCountedShares && doubleCountedShares.gt(0)) {
      const doubleCountedAssets = doubleCountedShares.times(totalBaseAsset).div(totalSupply)
      totalBaseAsset = totalBaseAsset.minus(doubleCountedAssets)
    }
    api.add(baseAsset, totalBaseAsset.toFixed(0))
  })

  const dvvVaultsAssets = await api.multiCall({ calls: dvvVaults.map(vault => vault.address), abi: abi.asset, permitFailure: true })
  const dvvVaultsTotalAssets = await api.multiCall({ calls: dvvVaults.map(vault => vault.address), abi: abi.totalAssets, permitFailure: true })
  const dvvVaultsTotalSupply = await api.multiCall({ calls: dvvVaults.map(vault => vault.address), abi: abi.totalSupply, permitFailure: true })

  for (let i = 0; i < dvvVaults.length; i++) {
    const vaultAddress = dvvVaults[i].address
    const asset = dvvVaultsAssets[i]
    let totalAssets = BigNumber(dvvVaultsTotalAssets[i])
    const totalSupply = BigNumber(dvvVaultsTotalSupply[i])
    if (!asset || !totalAssets || !totalSupply || totalSupply.eq(0)) return
    const doubleCountedShares = doubleCountedSharesByVault[vaultAddress]
    if (doubleCountedShares && doubleCountedShares.gt(0)) {
      const doubleCountedAssets = doubleCountedShares.times(totalAssets).div(totalSupply)
      totalAssets = totalAssets.minus(doubleCountedAssets)
    }
    api.add(asset, totalAssets.toFixed(0))
  }
}

const chains = ['ethereum', 'monad', 'mezo', 'rootstock']

module.exports.doublecounted = true

chains.forEach((chain) => {
  module.exports[chain] = { tvl }
})
