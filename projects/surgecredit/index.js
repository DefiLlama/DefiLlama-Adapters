const { sumTokens } = require('../helper/chain/bitcoin')
const { cachedGraphQuery } = require('../helper/cache')
const ADDRESSES = require('../helper/coreAssets.json')

const VAULT_MANAGER = '0x0D5D12de1cC71060A38F25DD9d24DA1DD6eB705a'
const GET_TOTALS_ABI = 'function getTotals() view returns (uint256 totalCollateral, uint256 totalDebt)'

// Each loan's collateral sits in its own Taproot vault (Loan.btcVaultAddress from the Surge indexer).
// fetchById paginates by an `id` cursor (id_gt $lastId), so the query must expose and order by `id`.
const INDEXER = 'https://indexer.surge.build/v1/graphql'
const VAULTS_QUERY = `query ($lastId: String!) {
  Loan(
    where: { chainId: { _eq: 8453 }, id: { _gt: $lastId } }
    order_by: { id: asc }
    limit: 1000
  ) { id btcVaultAddress }
}`

async function bitcoinTvl(api) {
  const loans = await cachedGraphQuery('surgecredit/btc-vaults', INDEXER, VAULTS_QUERY, { fetchById: true })
  const owners = [...new Set(loans.map(l => l.btcVaultAddress).filter(Boolean))]
  return sumTokens({ owners, timestamp: api.timestamp })
}

// Borrowed: outstanding USDC debt across all positions (the active credit).
async function baseBorrowed(api) {
  const totals = await api.call({ target: VAULT_MANAGER, abi: GET_TOTALS_ABI })
  api.add(ADDRESSES.base.USDC, totals.totalDebt)
}

module.exports = {
  methodology: 'TVL is the native BTC collateral locked in per-loan non-custodial Taproot vaults, summed directly from the vault addresses on Bitcoin L1. Each vault address is derived deterministically from the borrower on-chain pubkey and served by the Surge indexer (Loan.btcVaultAddress). Borrowed is the outstanding USDC debt across all positions (the active credit), read from VaultManager.getTotals() on Base. Idle USDC lending liquidity is not counted in TVL.',
  timetravel: false,
  bitcoin: { tvl: bitcoinTvl },
  base: { borrowed: baseBorrowed },
}
