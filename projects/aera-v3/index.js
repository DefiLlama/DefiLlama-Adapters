const BGBTC = '0x31011317764e097b28d159a8145b92bfa453f606'
const WBTC = 'ethereum:0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'

// Top-level production multi-depositor vaults only. Factory discovery is not
// used because the factories also contain staging, development, retired, and
// child vaults that should not be included in production TVL.
const vaults = {
  ethereum: [
    '0x00000000d8f3d6c5DFeB2D2b5ED2276095f3aF44', // gpAAFalconX
    '0x3bd9248048df95Db4fBD748C6CD99C1bAa40bAD0', // gtUSDa
    '0xefF0AE5b39271b33f448cD408b51DC8aA72a672b', // gtBTC
    '0xeA40De595f099cA04695b0Ca105499E50AF77f92', // gtSkyLooping
    '0xc4C7Ea9af473046559F0492bbBa186A2E043fe94', // glPRIME
    '0x2B02DA0A074b690075f0b8E6921e2526B0Ff7896', // exaETH
    '0x15218Fbb0Efc0A3D5D731a242d853fa625532C3D', // gtUSDhy
  ],
  base: [
    '0x000000000001CdB57E58Fa75Fe420a0f4D6640D5', // gtUSDa
    '0xDDDFf4bE1a90CD6F05CE1e977c674ff3aa556C97', // exaUSD
    '0xFB4c96dD16122bbec6b18D632ec7c9ecbD5ce18c', // dptUSD
    '0x970173b2666736ebe040e2C3bef6c62664D9b0B9', // gtLPRAEN
    '0x785F3D804aCdA02CD0eC2243dc6f9F408CC075C8', // gtLPSNIB
  ],
  morph: [
    '0x85A1D961F1D1bbD9b4A6D96106c5bF9ae91f0510', // gtOVBG
  ],
  arbitrum: [
    '0x000000001DC8bd45d7E7829fb1c969cbe4D0D1eC', // gtUSDa
    '0x364d2ACDc98d1bF8A734141178996E9fB0b37d2E', // gtLPLUIA
  ],
  optimism: [
    '0x000000001DC8bd45d7E7829fb1c969cbe4D0D1eC', // gtUSDa
  ],
}

// V1 calculators do not expose getVaultValueAtLastUpdate and retain the old
// single-unit-price VaultState layout. Keep this explicit so a failed V2 call
// cannot silently fall back to decoding an incompatible state struct.
const legacyVaults = new Set([
  'ethereum:0x00000000d8f3d6c5dfeb2d2b5ed2276095f3af44', // gpAAFalconX
  'ethereum:0x3bd9248048df95db4fbd748c6cd99c1baa40bad0', // gtUSDa
  'ethereum:0xeff0ae5b39271b33f448cd408b51dc8aa72a672b', // gtBTC
  'base:0x000000000001cdb57e58fa75fe420a0f4d6640d5', // gtUSDa
  'base:0x785f3d804acda02cd0ec2243dc6f9f408cc075c8', // gtLPSNIB
  'arbitrum:0x000000001dc8bd45d7e7829fb1c969cbe4d0d1ec', // gtUSDa
  'optimism:0x000000001dc8bd45d7e7829fb1c969cbe4d0d1ec', // gtUSDa
])

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
  if (legacyVaults.has(`${api.chain}:${vault.toLowerCase()}`)) {
    return getLegacyVaultValue(api, vault, feeCalculator)
  }

  return api.call({
    abi: 'function getVaultValueAtLastUpdate(address vault) view returns (uint256)',
    target: feeCalculator,
    params: [vault],
  })
}

async function tvl(api) {
  await Promise.all(vaults[api.chain].map(async vault => {
    const feeCalculator = await api.call({ abi: 'address:feeCalculator', target: vault })
    const [numeraireToken, value] = await Promise.all([
      api.call({ abi: 'address:NUMERAIRE', target: feeCalculator }),
      getVaultValue(api, vault, feeCalculator),
    ])

    // bgBTC and WBTC both use 8 decimals. The Morph bgBTC address is not
    // currently priced by the DefiLlama coins service, so use WBTC's BTC price.
    if (api.chain === 'morph' && numeraireToken.toLowerCase() === BGBTC) {
      api.addTokenVannila(WBTC, value)
    } else {
      api.add(numeraireToken, value)
    }
  }))
}

module.exports = {
  methodology: 'Counts the last reported net asset value of top-level production Aera V3 multi-depositor vaults. Staging, development, retired, and child vaults are excluded.',
  start: 1748414859,
  ethereum: { tvl },
  base: { tvl },
  morph: { tvl },
  arbitrum: { tvl },
  optimism: { tvl },
}
