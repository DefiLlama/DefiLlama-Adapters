/**
 * Chainflip Lending — TVL adapter
 *
 * METHODOLOGY (aligned with Aave v3 and Compound v3)
 * ─────────────────────────────────────────────────────────────────────────
 * DefiLlama splits lending protocols into three metrics:
 *
 *   TVL      = assets sitting idle in the protocol
 *              (lender deposits not yet lent out, plus borrower collateral
 *               that is locked but not earning interest for lenders)
 *
 *   Borrowed = outstanding principal owed by active borrowers
 *
 *   Supplied = TVL + Borrowed
 *              (total assets entrusted to the protocol by all participants)
 *
 * Aave v3 maps to these as follows:
 *   Supplied → aToken.totalSupply()
 *   Borrowed → variableDebtToken.totalSupply()
 *   TVL      → Supplied − Borrowed  (idle reserve liquidity)
 *
 * Compound v3 uses the same split via Comet.totalSupply() / totalBorrow().
 *
 * Chainflip Lending exposes equivalent values through its Substrate RPC:
 *   pool.total_amount     → Supplied  (what lenders deposited in aggregate)
 *   pool.available_amount → TVL share (idle, not yet lent)
 *   total − available     → Borrowed  (deployed in active loans)
 *
 * Borrower collateral (BTC posted to back USDT/USDC loans) is added to TVL
 * via cf_loan_accounts, mirroring the way Aave counts collateral-only
 * positions from users who supply but never borrow.
 *
 * DATA SOURCE — on-chain RPC instead of the GraphQL cache
 * ─────────────────────────────────────────────────────────────────────────
 * The previous adapter queried https://cache-service.chainflip.io/graphql,
 * a centralised indexer that can lag behind the chain or become unavailable.
 * Aave and Compound adapters read smart-contract storage directly via
 * eth_call; we replicate that guarantee here through the Chainflip node's
 * custom JSON-RPC methods (cf_lending_pools, cf_loan_accounts), which read
 * live pallet storage with no intermediary. All amounts are returned as
 * hex-encoded u128 values in the asset's native denomination
 * (satoshis for BTC, wei for ETH, lamports for SOL, μUSDC/μUSDT for
 * stablecoins).
 *
 * NOTE — chainflip:Sol pricing
 * ─────────────────────────────────────────────────────────────────────────
 * coins.llama.fi does not yet have a price entry for chainflip:Sol because
 * the Sol/Usdc pool on the Chainflip AMM holds only ~$91 USDC in liquidity,
 * below the confidence threshold used by the DefiLlama price oracle. The SOL
 * balance in the lending protocol is currently ~0.82 SOL (<$60) so the
 * impact on reported TVL is negligible. A companion PR to DefiLlama/coins
 * adds the mapping chainflip:Sol → coingecko:solana to resolve this.
 */

const { post } = require('../helper/http')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Chainflip mainnet Substrate node — custom cf_* RPC methods read pallet
// storage directly, equivalent to eth_call on EVM chains.
const RPC_ENDPOINT = 'https://rpc.chainflip.io'

/**
 * Convert the on-chain asset descriptor { chain, asset } to the token key
 * the DefiLlama SDK uses on the chainflip chain (e.g. "Btc", "Eth", "Usdc").
 * These keys are already registered in the SDK's price resolver for this chain.
 *
 * Arbitrum ETH is handled as a special case to avoid collision with
 * Ethereum ETH, which uses the same asset ticker but a different chain.
 */
function assetKey({ chain, asset }) {
  if (chain === 'Arbitrum' && asset === 'ETH') return 'ArbEth'
  return asset.charAt(0).toUpperCase() + asset.slice(1).toLowerCase()
}

async function cfRpc(method, params = []) {
  const res = await post(RPC_ENDPOINT, { jsonrpc: '2.0', method, params, id: 1 })
  return res.result
}

/**
 * TVL = idle lender supply (available_amount) + borrower collateral
 *
 * Aave analogue:
 *   available_amount ≈ underlying token balance held by the Pool contract
 *   collateral       ≈ aToken balance of positions with
 *                       usageAsCollateralEnabled = true that carry active debt
 */
async function tvl(api) {
  const [pools, loanAccounts] = await Promise.all([
    cfRpc('cf_lending_pools', [null, null]),
    cfRpc('cf_loan_accounts', [null, null]),
  ])

  for (const pool of pools)
    api.add(assetKey(pool.asset), BigInt(pool.available_amount).toString())

  for (const account of loanAccounts)
    for (const col of account.collateral)
      api.add(assetKey(col), BigInt(col.amount).toString())

  return sumTokens2({ api })
}

/**
 * Borrowed = total_amount − available_amount per pool
 *
 * Equivalent to reading variableDebtToken.totalSupply() on Aave v3 or
 * Comet.totalBorrow() on Compound v3 — a single source-of-truth value
 * that cannot diverge from actual chain state.
 *
 * BigInt is used throughout because ETH amounts expressed in wei exceed
 * Number.MAX_SAFE_INTEGER.
 */
async function borrowed(api) {
  const pools = await cfRpc('cf_lending_pools', [null, null])

  for (const pool of pools) {
    const b = BigInt(pool.total_amount) - BigInt(pool.available_amount)
    if (b > 0n) api.add(assetKey(pool.asset), b.toString())
  }

  return sumTokens2({ api })
}

module.exports = {
  methodology: 'TVL is the available (not yet borrowed) lending supply plus collateral deposited by borrowers. Borrowed is the total outstanding loan principal. Supplied (TVL + Borrowed) equals the total assets deposited by lenders plus collateral.',
  timetravel: false,
  chainflip: { tvl, borrowed },
}
