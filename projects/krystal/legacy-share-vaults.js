const { getLogs } = require('../helper/cache/getLogs')

// Legacy share vaults - the earlier generation of publicly depositable vaults, created by a series
// of vault factories that have since been superseded by SharedVaultFactory (see community.js).
//
// A legacy vault values itself in a single principal token: `getTotalValue()` returns the vault's
// whole position, LP principal and uncollected fees included, denominated in `principalToken`.
// Later factories added a per-vault owner fee to the config struct and to the VaultCreated event,
// which changes both signatures - hence the two variants tracked side by side below.
const config = {
  ethereum: {
    factories: [
      { factory: '0x54654bba3fe24f1fc463d31fdb5602b8b0af7dc0', fromBlock: 22374491 },
      { factory: '0xc8f4d6860e77c9f05a391d3e247a4146c38da203', fromBlock: 22788449 },
      { factory: '0xdf2deefe9e905db881d06b063d3e96c27bcfda7a', fromBlock: 22836895, customOwnerFee: true },
      { factory: '0x3a35f9fef2ba83702b6e20d79fff96f77c922cf3', fromBlock: 22952824, customOwnerFee: true },
      { factory: '0x87077592b446e9207c544c5614e19b56bc6970d5', fromBlock: 23073168, customOwnerFee: true },
    ],
  },
  base: {
    factories: [
      { factory: '0x54654bba3fe24f1fc463d31fdb5602b8b0af7dc0', fromBlock: 29449424 },
      { factory: '0xd3de3b39feb0d21fe02c9e385315ddc9ca99dfd5', fromBlock: 29303413 },
      { factory: '0xc8f4d6860e77c9f05a391d3e247a4146c38da203', fromBlock: 31938923 },
      { factory: '0xdf2deefe9e905db881d06b063d3e96c27bcfda7a', fromBlock: 32253341, customOwnerFee: true },
      { factory: '0x3a35f9fef2ba83702b6e20d79fff96f77c922cf3', fromBlock: 32588280, customOwnerFee: true },
      { factory: '0x87077592b446e9207c544c5614e19b56bc6970d5', fromBlock: 33537305, customOwnerFee: true },
    ],
  },
  arbitrum: {
    factories: [
      { factory: '0x54654bba3fe24f1fc463d31fdb5602b8b0af7dc0', fromBlock: 330479415 },
      { factory: '0x92c355c372eb9c1eca92a0962610626a8b2ce975', fromBlock: 329400485 },
      { factory: '0xc8f4d6860e77c9f05a391d3e247a4146c38da203', fromBlock: 351376737 },
      { factory: '0xdf2deefe9e905db881d06b063d3e96c27bcfda7a', fromBlock: 353725498, customOwnerFee: true },
      { factory: '0x3a35f9fef2ba83702b6e20d79fff96f77c922cf3', fromBlock: 359319739, customOwnerFee: true },
      { factory: '0x87077592b446e9207c544c5614e19b56bc6970d5', fromBlock: 365137843, customOwnerFee: true },
    ],
  },
  polygon: {
    factories: [
      { factory: '0x54654bba3fe24f1fc463d31fdb5602b8b0af7dc0', fromBlock: 70786808 },
      { factory: '0xc8f4d6860e77c9f05a391d3e247a4146c38da203', fromBlock: 73241511 },
      { factory: '0xdf2deefe9e905db881d06b063d3e96c27bcfda7a', fromBlock: 73516877, customOwnerFee: true },
      { factory: '0x3a35f9fef2ba83702b6e20d79fff96f77c922cf3', fromBlock: 74146941, customOwnerFee: true },
      { factory: '0x87077592b446e9207c544c5614e19b56bc6970d5', fromBlock: 74819808, customOwnerFee: true },
    ],
  },
  bsc: {
    factories: [
      { factory: '0x54654bba3fe24f1fc463d31fdb5602b8b0af7dc0', fromBlock: 48703522 },
      { factory: '0xc8f4d6860e77c9f05a391d3e247a4146c38da203', fromBlock: 52127753 },
      { factory: '0xdf2deefe9e905db881d06b063d3e96c27bcfda7a', fromBlock: 52701228, customOwnerFee: true },
      { factory: '0x3a35f9fef2ba83702b6e20d79fff96f77c922cf3', fromBlock: 54567569, customOwnerFee: true },
      { factory: '0x87077592b446e9207c544c5614e19b56bc6970d5', fromBlock: 56504339, customOwnerFee: true },
    ],
  },
  ronin: {
    factories: [
      { factory: '0x3f06f7d2ab15f42b92f3e8b266f79d4e831e702b', fromBlock: 45377320 },
      { factory: '0xc8f4d6860e77c9f05a391d3e247a4146c38da203', fromBlock: 46360967 },
      { factory: '0xdf2deefe9e905db881d06b063d3e96c27bcfda7a', fromBlock: 46556861, customOwnerFee: true },
      { factory: '0x3a35f9fef2ba83702b6e20d79fff96f77c922cf3', fromBlock: 46876463, customOwnerFee: true },
      { factory: '0x87077592b446e9207c544c5614e19b56bc6970d5', fromBlock: 47505286, customOwnerFee: true },
    ],
  },
}

const excludedVaults = [
  '0xa9d939b440889946E6CEC3E1D4218E069605af6f',
  '0xC1592E4Ce1FB6B9E278E209483CC9B2107a1736f',
  '0x516Df58459771d20A57947203871B02af1f20B1B',
  '0xdDBe16Cf812E3CE3796D8C8fD67f1F52Ecc99e79',
]

const abis = {
  getTotalValue: 'function getTotalValue() view returns (uint256 totalValue)',
  getVaultConfig: 'function getVaultConfig() view returns (bool allowDeposit, uint8 rangeStrategyType, uint8 tvlStrategyType, address principalToken, address[] memory supportedAddresses)',
  getVaultConfigWithCustomOwnerFee: 'function getVaultConfig() view returns (bool allowDeposit, uint8 rangeStrategyType, uint8 tvlStrategyType, address principalToken, address[] memory supportedAddresses, uint16 vaultOwnerFeeBasisPoint)',
  vaultCreated: 'event VaultCreated(address owner, address vault, tuple(string name, string symbol, uint256 principalTokenAmount, tuple(bool allowDeposit, uint8 rangeStrategyType, uint8 tvlStrategyType, address principalToken, address[] supportedAddresses) config) params)',
  vaultCreatedWithCustomOwnerFee: 'event VaultCreated(address owner, address vault, tuple(string name, string symbol, uint256 principalTokenAmount, uint16 vaultOwnerFeeBasisPoint, tuple(bool allowDeposit, uint8 rangeStrategyType, uint8 tvlStrategyType, address principalToken, address[] supportedAddresses) config) params)',
}

async function tvl(api) {
  const chainConfig = config[api.chain]
  if (!chainConfig) return

  const vaults = []
  const vaultsWithCustomOwnerFee = []

  for (const { factory, fromBlock, customOwnerFee } of chainConfig.factories) {
    const logs = await getLogs({
      api,
      target: factory,
      fromBlock,
      eventAbi: customOwnerFee ? abis.vaultCreatedWithCustomOwnerFee : abis.vaultCreated,
      onlyArgs: true,
    })

    const bucket = customOwnerFee ? vaultsWithCustomOwnerFee : vaults
    logs.forEach(i => {
      if (excludedVaults.includes(i.vault)) return
      bucket.push(i.vault)
    })
  }

  const [vaultConfigs, vaultTotalValues, customOwnerFeeConfigs, customOwnerFeeTotalValues] = await Promise.all([
    api.multiCall({ abi: abis.getVaultConfig, calls: vaults, permitFailure: false }),
    api.multiCall({ abi: abis.getTotalValue, calls: vaults, permitFailure: false }),
    api.multiCall({ abi: abis.getVaultConfigWithCustomOwnerFee, calls: vaultsWithCustomOwnerFee, permitFailure: false }),
    api.multiCall({ abi: abis.getTotalValue, calls: vaultsWithCustomOwnerFee, permitFailure: false }),
  ])

  api.addTokens(vaultConfigs.map(i => i.principalToken), vaultTotalValues)
  api.addTokens(customOwnerFeeConfigs.map(i => i.principalToken), customOwnerFeeTotalValues)
}

module.exports = { config, tvl }
