const sdk = require('@defillama/sdk')

// Surge Credit — BTC-collateralized USDC lending on Base (chainId 8453).
// Slug `surgecredit` (bare `surge` is taken by an unrelated Arbitrum lender).

const VAULT_MANAGER = '0x0D5D12de1cC71060A38F25DD9d24DA1DD6eB705a'
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'

// VaultManager keeps the protocol-wide aggregate: BTC collateral in satoshis
// (1e8) and USDC debt (1e6). Collateral lives in per-loan, non-custodial Taproot
// vaults with deterministic addresses derived off-chain (no public address set to
// sum UTXOs over), so the on-chain aggregate is the canonical figure.
const GET_TOTALS_ABI =
  'function getTotals() view returns (uint256 totalCollateral, uint256 totalDebt)'

// TVL: native BTC collateral locked in the Taproot vaults (satoshis -> BTC).
// Read from Base (VaultManager), credited as native bitcoin.
async function bitcoinTvl(api) {
  const baseApi = new sdk.ChainApi({ chain: 'base', timestamp: api.timestamp })
  const totals = await baseApi.call({ target: VAULT_MANAGER, abi: GET_TOTALS_ABI })
  api.addCGToken('bitcoin', totals.totalCollateral / 1e8)
}

// Borrowed: outstanding USDC debt across all positions — the active credit.
// This is what DeFiLlama renders on the "Active Loans" tab.
async function baseBorrowed(api) {
  const totals = await api.call({ target: VAULT_MANAGER, abi: GET_TOTALS_ABI })
  api.add(USDC, totals.totalDebt)
}

module.exports = {
  methodology:
    'TVL is the native BTC collateral locked in per-loan non-custodial Taproot vaults, read from the protocol-wide on-chain aggregate VaultManager.getTotals() (satoshis) on Base. Borrowed is the outstanding USDC debt across all positions (the active credit). Idle USDC lending liquidity is not counted in TVL.',
  bitcoin: { tvl: bitcoinTvl },
  base: { borrowed: baseBorrowed },
}
