const CHAIN_CONFIG = {
  ethereum: {
    boringVault: {
      address: '0x2da04ca581a0083edfadaf767c41c657c3b9b505',
      asset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      accountant: '0xb53ff53ae8970f6692282af81eae75084e5992f1',
    },
  },

  arbitrum: {
    venzoVault: {
      address: '0x2Bdf0ed5dAe7C37b314eC1f7dcf401bb52EA967A',
      asset: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    },

    boringVault: {
      address: '0x2da04ca581a0083edfadaf767c41c657c3b9b505',
      asset: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      accountant: '0xb53ff53ae8970f6692282af81eae75084e5992f1',
    },
  },
}

function hasValue(value) {
  return value !== null && value !== undefined
}

/**
 * Venzo vault TVL.
 *
 * totalAssets() is preferred. It can revert when the latest valuation
 * report has expired, so cachedActiveNav() is used as a fallback.
 */
async function addVenzoVaultTvl(api, vault) {
  if (!vault) return

  const { address, asset } = vault

  let balance = await api.call({
    target: address,
    abi: 'uint256:totalAssets',
    permitFailure: true,
  })

  if (!hasValue(balance)) {
    const cachedActiveNav = await api.call({
      target: address,
      abi: 'function cachedActiveNav() view returns (uint256,uint256,address)',
      permitFailure: true,
    })

    balance = cachedActiveNav?.[0]
  }

  if (hasValue(balance)) {
    api.add(asset, balance)
  }
}

/**
 * Boring Vault TVL.
 *
 * TVL = total share supply × accountant rate ÷ share unit.
 */
async function addBoringVaultTvl(api, vault) {
  if (!vault) return

  const {
    address,
    asset,
    accountant,
  } = vault

  const [totalSupply, shareDecimals, safeRate] = await Promise.all([
    api.call({
      target: address,
      abi: 'erc20:totalSupply',
      permitFailure: true,
    }),
    api.call({
      target: address,
      abi: 'erc20:decimals',
      permitFailure: true,
    }),
    api.call({
      target: accountant,
      abi: 'function getRateInQuoteSafe(address) view returns (uint256)',
      params: [asset],
      permitFailure: true,
    }),
  ])

  let rate = safeRate

  if (!hasValue(rate)) {
    rate = await api.call({
      target: accountant,
      abi: 'function getRateInQuote(address) view returns (uint256)',
      params: [asset],
      permitFailure: true,
    })
  }

  if (
      !hasValue(totalSupply) ||
      !hasValue(shareDecimals) ||
      !hasValue(rate)
  ) {
    return
  }

  const balance =
      (BigInt(totalSupply) * BigInt(rate)) /
      (10n ** BigInt(shareDecimals))

  api.add(asset, balance.toString())
}

async function tvl(api) {
  const config = CHAIN_CONFIG[api.chain]

  await addVenzoVaultTvl(api, config.venzoVault)
  await addBoringVaultTvl(api, config.boringVault)
}

Object.keys(CHAIN_CONFIG).forEach(chain => {
  module.exports[chain] = { tvl }
})
