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

/** TVL = idle lender supply (available_amount) + borrower collateral */
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

/** Borrowed = total_amount − available_amount per pool */
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
