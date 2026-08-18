const { ethers } = require('ethers')

const getVaultValueAbi = 'function getVaultValueAtLastUpdate(address vault) view returns (uint256)'
const getVaultValueSelector = ethers.id('getVaultValueAtLastUpdate(address)').slice(2, 10)

async function getLegacyVaultValue(api, vault, feeCalculator) {
  const [totalSupply, decimals, vaultState] = await Promise.all([
    api.call({ abi: 'uint256:totalSupply', target: vault }),
    api.call({ abi: 'uint8:decimals', target: vault }),
    api.call({
      abi: 'function getVaultState(address vault) external view returns ((bool paused, uint8 maxPriceAge, uint16 minUpdateIntervalMinutes, uint16 maxPriceToleranceRatio, uint16 minPriceToleranceRatio, uint8 maxUpdateDelayDays, uint32 timestamp, uint24 accrualLag, uint128 unitPrice, uint128 highestPrice, uint128 lastTotalSupply))',
      target: feeCalculator,
      params: [vault],
    }),
  ])

  return (BigInt(totalSupply) * BigInt(vaultState[8]) / (10n ** BigInt(decimals))).toString()
}

async function getVaultValue(api, vault, feeCalculator) {
  // Aera calculators are direct deployments, so the runtime selector reliably
  // distinguishes V2 from legacy without swallowing RPC or contract failures.
  const bytecode = await api.provider.getCode(feeCalculator, api.block)
  const supportsV2Getter = bytecode.toLowerCase().includes(getVaultValueSelector)

  if (!supportsV2Getter) return getLegacyVaultValue(api, vault, feeCalculator)

  return api.call({
    abi: getVaultValueAbi,
    target: feeCalculator,
    params: [vault],
  })
}

module.exports = { getVaultValue, getVaultValueAbi, getVaultValueSelector }
