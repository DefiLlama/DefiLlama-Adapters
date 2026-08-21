const getVaultValueAbi = 'function getVaultValueAtLastUpdate(address vault) view returns (uint256)'
const versionAbi = 'string:version'

function isSelectorUnavailable(error) {
  const message = String(error?.message ?? error).toLowerCase()
  return message.includes('execution reverted')
    || message.includes('call reverted')
    || message.includes('missing revert data')
}

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
  // V2 calculators expose a non-reverting version getter. Its on-chain revert
  // confirms a legacy calculator; transport and other failures must propagate.
  try {
    await api.call({ abi: versionAbi, target: feeCalculator })
  } catch (error) {
    if (!isSelectorUnavailable(error)) throw error
    return getLegacyVaultValue(api, vault, feeCalculator)
  }

  return api.call({
    abi: getVaultValueAbi,
    target: feeCalculator,
    params: [vault],
  })
}

module.exports = { getVaultValue, getVaultValueAbi, versionAbi }
