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

/** @param {ChainApi} api */
async function borrowed(api) {
  const vaults = await fetchVaultBalances(api)
  for (const v of vaults) {
    for (const l of v.liabilities) api.add(l.token, bi(l.amount, l.decimals))
  }
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
 * @property {TokenAmount[]} liabilities - BALANCE_SHEET vaults: liability_tokens balances. LEVERAGE vaults: borrowed debt token + amount. Empty for ERC4626/REPRICING/AUTO_STAKING.
 */

/** @typedef {import('@defillama/sdk').ChainApi} ChainApi */
