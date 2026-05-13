const { get } = require('../helper/http')
const ethers = require('ethers')

const API_BASE = 'https://origami-api.automation-templedao.link'
const SUPPORTED_CHAINS = ['ethereum', 'berachain', 'plasma']

module.exports = {
  doublecounted: true,
  ...Object.fromEntries(SUPPORTED_CHAINS.map((c) => [c, { tvl, borrowed }])),
}

/**
 * @param {number} n 
 * @param {number} decimals 
 * @returns {bigint}
 */
function bi(n, decimals) {
  return ethers.parseUnits(n.toFixed(decimals), decimals)
}

/**
 * @param {ChainApi} api
 * @returns {Promise<VaultBalances[]>}
 */
async function fetchVaultBalances(api) {
  const url = new URL("/public/external/vault-token-balances", API_BASE)
  url.searchParams.append("input", JSON.stringify({ chain: api.chainId }))

  const { vault_balances } = await get(url)
  return vault_balances
}

/** @param {ChainApi} api */
async function tvl(api) {
  const vaults = await fetchVaultBalances(api)
  for (const v of vaults) {
    for (const a of v.assets) api.add(a.token, bi(a.amount, a.decimals))
    for (const l of v.liabilities) api.add(l.token, -bi(l.amount, l.decimals))
  }
}

/**
 * @param {ChainApi} api
 * @param {string[]} leveragedVaults - Addresses of vaults whose `vault_kinds` contains 'LEVERAGE'
 */
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

/**
 * @param {ChainApi} api
 * @param {VaultBalances[]} vaults
 */
async function nonLeverageVaultLiabilities(api, vaults) {
  for (const v of vaults) {
    for (const l of v.liabilities) api.add(l.token, bi(l.amount, l.decimals))
  }
}

/** @param {ChainApi} api */
async function borrowed(api) {
  const vaults = await fetchVaultBalances(api)
  const leverageVaults = vaults.filter((v) => v.vault_kinds.includes('LEVERAGE')).map((v) => v.address)
  const nonLeverageVaults = vaults.filter(v => !v.vault_kinds.includes('LEVERAGE'))

  await borrowedLeveragedVaults(api, leverageVaults)
  await nonLeverageVaultLiabilities(api, nonLeverageVaults)
}

/**
 * Origami vault kind tag. A single vault may carry multiple kinds — e.g. a
 * leveraged ERC4626 vault returns `['ERC4626', 'LEVERAGE']`.
 * @typedef {'ERC4626' | 'REPRICING' | 'LEVERAGE' | 'BALANCE_SHEET' | 'AUTO_STAKING'} VaultKind
 */

/**
 * Single token entry returned by the vault-token-balances endpoint.
 * @typedef {Object} TokenAmount
 * @property {string} token - 0x-prefixed ERC20 address
 * @property {number} amount - Decimals-normalized (human-readable) balance
 * @property {number} decimals - Token decimals, used to denormalize back to raw uint256
 */

/**
 * Per-vault row returned by the vault-token-balances endpoint.
 * @typedef {Object} VaultBalances
 * @property {string} address - Vault contract address
 * @property {VaultKind[]} vault_kinds
 * @property {TokenAmount[]} assets
 * @property {TokenAmount[]} liabilities - Only populated for BALANCE_SHEET vaults; LEVERAGE debt is on-chain only (not indexed yet)
 */

/** @typedef {import('@defillama/sdk').ChainApi} ChainApi */
