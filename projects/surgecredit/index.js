const { post } = require('../helper/http')
const { sumTokens } = require('../helper/chain/bitcoin')

// Surge Credit: BTC-collateralized USDC lending on Base (chainId 8453).
// Slug `surgecredit` (bare `surge` is taken by an unrelated Arbitrum lender).

const VAULT_MANAGER = '0x0D5D12de1cC71060A38F25DD9d24DA1DD6eB705a'
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'

const GET_TOTALS_ABI =
  'function getTotals() view returns (uint256 totalCollateral, uint256 totalDebt)'

// Each loan's collateral lives in its own non-custodial Taproot (P2TR) vault. The
// vault address is deterministic (derived from the borrower's on-chain x-only pubkey
// and EVM address), computed by our indexer at loan creation and exposed as
// Loan.btcVaultAddress. We fetch the live address set and sum the actual UTXO balances
// on Bitcoin L1 (per PR #20190: track BTC via the custody addresses, compute TVL on-chain).
const INDEXER = 'https://indexer.surge.build/v1/graphql'

async function getVaultAddresses() {
  const owners = []
  const seen = new Set()
  const pageSize = 1000
  let offset = 0
  // Paginate; the vault set grows one address per loan.
  for (;;) {
    const query = `query ($limit: Int!, $offset: Int!) {
      Loan(
        where: { chainId: { _eq: 8453 } }
        limit: $limit
        offset: $offset
        order_by: { nftId: asc }
      ) { btcVaultAddress }
    }`
    const res = await post(INDEXER, { query, variables: { limit: pageSize, offset } })
    const rows = (res && res.data && res.data.Loan) || []
    for (const r of rows) {
      const addr = r.btcVaultAddress
      if (addr && !seen.has(addr)) {
        seen.add(addr)
        owners.push(addr)
      }
    }
    if (rows.length < pageSize) break
    offset += pageSize
  }
  return owners
}

// TVL: native BTC held on-chain across every per-loan Taproot vault address.
async function bitcoinTvl(api) {
  const owners = await getVaultAddresses()
  return sumTokens({ owners, timestamp: api.timestamp })
}

// Borrowed: outstanding USDC debt across all positions (the active credit).
// This is what DeFiLlama renders on the "Active Loans" tab.
async function baseBorrowed(api) {
  const totals = await api.call({ target: VAULT_MANAGER, abi: GET_TOTALS_ABI })
  api.add(USDC, totals.totalDebt)
}

module.exports = {
  methodology:
    'TVL is the native BTC collateral locked in per-loan non-custodial Taproot vaults, summed directly from the vault addresses on Bitcoin L1. Each vault address is derived deterministically from the borrower on-chain pubkey and served by the Surge indexer (Loan.btcVaultAddress). Borrowed is the outstanding USDC debt across all positions (the active credit), read from VaultManager.getTotals() on Base. Idle USDC lending liquidity is not counted in TVL.',
  bitcoin: { tvl: bitcoinTvl },
  base: { borrowed: baseBorrowed },
}
