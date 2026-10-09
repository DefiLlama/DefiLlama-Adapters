const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')

// P2PLendingSErc20.20260310 markets: collateral sits in per-borrower vaults, loans go lender -> borrower directly
const P2P_MARKETS = [
  { market: '0xBFd975E99348379EB52121eF2586Adf5CBFE6C32', fromBlock: 24635460 },
  { market: '0x0c14ba3eB1EDd16Cd9f4015B461c21fCf264EFd8', fromBlock: 24642382 },
]

const REPLACED_LOAN_FIELDS = 'bytes32 id, uint256 amount, uint256 apr, uint256 maturity, uint256 start_time, address borrower, address lender, uint256 collateral_amount, uint256 min_collateral_amount, uint256 call_eligibility, uint256 call_window, uint256 liquidation_ltv, uint256 initial_ltv, uint256 origination_fee_amount, uint256 protocol_upfront_fee_amount, uint256 protocol_settlement_fee, uint256 partial_liquidation_fee, uint256 full_liquidation_fee, bytes32 offer_id, bytes32 offer_tracing_id, bytes32 original_loan_id, uint256 paid_principal, uint256 paid_interest, uint256 paid_protocol_settlement_fee_amount'

const eventAbis = {
  LoanCreated: 'event LoanCreated(bytes32 id, uint256 amount, uint256 apr, address payment_token, uint256 maturity, uint256 start_time, address borrower, address lender, address collateral_token, uint256 collateral_amount, uint256 min_collateral_amount, uint256 call_eligibility, uint256 call_window, uint256 liquidation_ltv, address oracle_addr, uint256 initial_ltv, uint256 origination_fee_amount, uint256 protocol_upfront_fee_amount, uint256 protocol_settlement_fee, uint256 partial_liquidation_fee, uint256 full_liquidation_fee, bytes32 offer_id, bytes32 offer_tracing_id, uint256 oracle_rate_num, uint256 oracle_rate_den, uint256 vault_id, address vault_addr)',
  LoanReplaced: `event LoanReplaced(${REPLACED_LOAN_FIELDS})`,
  LoanReplacedByLender: `event LoanReplacedByLender(${REPLACED_LOAN_FIELDS})`,
  LoanPartiallyLiquidated: 'event LoanPartiallyLiquidated(bytes32 id, address borrower, address lender, uint256 written_off, uint256 collateral_claimed, uint256 liquidation_fee, uint256 updated_amount, uint256 updated_collateral_amount, uint256 updated_accrual_start_time, address liquidator, uint256 old_ltv, uint256 new_ltv)',
  LoanBorrowerTransferred: 'event LoanBorrowerTransferred(bytes32 loan_id, bytes32 new_loan_id, address old_borrower, address new_borrower, address lender, uint256 vault_id)',
}

const ZERO_HASH = '0x' + '0'.repeat(64)

async function getMarketState(api, { market, fromBlock }) {
  const names = Object.keys(eventAbis)
  const logs = await Promise.all(names.map(name => getLogs2({ api, target: market, eventAbi: eventAbis[name], fromBlock, extraKey: name, onlyArgs: false })))
  const { LoanCreated, LoanReplaced, LoanReplacedByLender, LoanPartiallyLiquidated, LoanBorrowerTransferred } = Object.fromEntries(names.map((name, i) => [name, logs[i].sort((a, b) => Number(a.blockNumber) - Number(b.blockNumber)).map(l => l.args)]))

  const principal = {}
  const partialPrincipal = {}
  const transferredFrom = {}
  LoanCreated.forEach(l => principal[l.id] = l.amount)
  LoanReplaced.concat(LoanReplacedByLender).forEach(l => principal[l.id] = l.amount)
  // a partial liquidation resets the debt to amount + accrued interest - written off, so the latest one wins
  LoanPartiallyLiquidated.forEach(l => partialPrincipal[l.id] = l.updated_amount)
  LoanBorrowerTransferred.forEach(l => transferredFrom[l.new_loan_id] = l.loan_id)

  const principalOf = (id) => {
    if (partialPrincipal[id] !== undefined) return partialPrincipal[id]
    if (principal[id] !== undefined) return principal[id]
    if (transferredFrom[id] !== undefined) return principalOf(transferredFrom[id])
    throw new Error(`zharta: no principal found for loan ${id} on ${market}`)
  }

  const loanIds = [...new Set([...Object.keys(principal), ...Object.keys(transferredFrom)])]
  // settled, liquidated, replaced and transferred loans are cleared from storage
  const loanHashes = await api.multiCall({ abi: 'function loans(bytes32) view returns (bytes32)', target: market, calls: loanIds.map(id => ({ params: [id] })) })
  const activeLoans = loanIds.filter((_, i) => loanHashes[i] !== ZERO_HASH)

  const transferredVaults = await api.multiCall({ abi: 'function vault_id_to_vault(address, uint256) view returns (address)', target: market, calls: LoanBorrowerTransferred.map(l => ({ params: [l.new_borrower, l.vault_id] })) })
  const vaults = [...LoanCreated.map(l => l.vault_addr), ...transferredVaults]

  return { vaults, borrowed: activeLoans.reduce((sum, id) => sum + principalOf(id), 0n) }
}

async function getMarkets(api) {
  await api.getBlock()
  const markets = P2P_MARKETS.filter(m => api.block >= m.fromBlock)
  const collateralTokens = await api.multiCall({ abi: 'address:collateral_token', calls: markets.map(m => m.market) })
  const paymentTokens = await api.multiCall({ abi: 'address:payment_token', calls: markets.map(m => m.market) })
  const states = await Promise.all(markets.map(m => getMarketState(api, m)))
  return markets.map(({ market }, i) => ({ market, collateralToken: collateralTokens[i], paymentToken: paymentTokens[i], ...states[i] }))
}

async function tvl(api) {
  const markets = await getMarkets(api)
  const ownerTokens = markets.flatMap(({ market, vaults, collateralToken, paymentToken }) => [market, ...vaults].map(owner => [[collateralToken, paymentToken], owner]))
  return sumTokens2({ api, ownerTokens })
}

async function borrowed(api) {
  const markets = await getMarkets(api)
  markets.forEach(({ paymentToken, borrowed }) => api.add(paymentToken, borrowed.toString()))
}

module.exports = {
  start: '2026-03-11',
  methodology: 'TVL counts the collateral (ACRED) and any USDC held by the Zharta P2P RWA lending markets and their per-borrower collateral vaults. Borrowed counts the outstanding USDC principal of active loans, rebuilt from the markets\' loan events and checked against on-chain loan state. Lent USDC goes directly from lender to borrower, so it is only counted as borrowed.',
  ethereum: {
    tvl,
    borrowed,
  },
}
