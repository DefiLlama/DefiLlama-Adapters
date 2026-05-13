const { get } = require('../helper/http')

const API_BASE = 'https://origami-api.automation-templedao.link'
const SUPPORTED_CHAINS = ['ethereum', 'berachain', 'plasma']

module.exports = {
  doublecounted: true,
  ...Object.fromEntries(SUPPORTED_CHAINS.map((c) => [c, { tvl, borrowed }])),
}

async function fetchVaultBalances(api) {
  const url = new URL("/public/external/vault-token-balances", API_BASE)
  url.searchParams.append("input", JSON.stringify({ chain: api.chainId }))

  const { vault_balances } = await get(url)
  return vault_balances
}

/**
 * Convert a decimals-normalized f64 (as returned by the vault-token-balances endpoint) 
 * to a raw uint256 BigInt
 */
function toBigInt(amount, decimals) {
  if (!Number.isFinite(amount) || amount === 0) return 0n

  const isNegative = amount < 0
  const abs = Math.abs(amount)
  if (decimals === 0) return (isNegative ? -1n : 1n) * BigInt(Math.round(abs))

  const [intPart, fracPart = ''] = abs.toFixed(decimals).split('.')
  const raw = BigInt(intPart + fracPart)
  return isNegative ? -raw : raw
}

async function tvl(api) {
  const vaults = await fetchVaultBalances(api)
  for (const v of vaults) {
    for (const a of v.assets) api.add(a.token, toBigInt(a.amount, a.decimals))
    for (const l of v.liabilities) api.add(l.token, -toBigInt(l.amount, l.decimals))
  }
}

async function borrowedLeveragedVaults(api, leveragedVaults) {
  if (!leveragedVaults.length) return
  const managers = await api.multiCall({ calls: leveragedVaults, abi: 'address:manager', permitFailure: true })
  const borrowLends = await api.multiCall({ calls: managers, abi: 'address:borrowLend', permitFailure: true })
  const [borrowTokens, borrowAmounts] = await Promise.all([
    api.multiCall({ calls: borrowLends, abi: 'address:borrowToken', permitFailure: true }),
    api.multiCall({ calls: borrowLends, abi: 'address:debtBalance', permitFailure: true }),
  ])
  leveragedVaults.forEach((_vault, i) => {
    const debtToken = borrowTokens[i]
    const debtAmount = borrowAmounts[i]
    if(!debtToken || !debtAmount) return
    api.addToken(debtToken, debtAmount)
  })
}

async function borrowedBalanceSheetVaults(api, vaults) {
  for (const v of vaults) {
    for (const l of v.liabilities) api.add(l.token, toBigInt(l.amount, l.decimals))
  }
}

async function borrowed(api) {
  const vaults = await fetchVaultBalances(api)
  const leverageVaults = vaults.filter((v) => v.vault_kinds.includes('LEVERAGE')).map((v) => v.address)

  await borrowedLeveragedVaults(api, leverageVaults)
  await borrowedBalanceSheetVaults(api, vaults)
}
