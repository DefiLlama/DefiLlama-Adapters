const { getLogs2 } = require('../helper/cache/getLogs')
const { getFixBalances } = require('../helper/portedTokens')

// Bridged USDC (USDC.e), 6 decimals — the collateral that backs every position.
const USDC_E = '0x9cb8142aebbcdc60af7c97af897a67a8f3ca71c2'

const VAULT_FACTORY = '0xc16B8b190064451c2FeEb2e77c4B2aC4c7009552'
const CONDITIONAL_TOKENS = '0xD28B8295Cd57F205e4d080Ff4c6d23C06a9EEe3a' // locks collateral backing open positions
const NEG_RISK_ADAPTER = '0x29e58C3916d1fD235f3d1e7fCF640fd1fA8BDb1e'
const FROM_BLOCK = 32200            // VaultFactory deploy
const NEG_RISK_FROM_BLOCK = 32196   // NegRiskAdapter deploy

// Neg-risk markets wrap USDC.e into a per-market WrappedCollateral clone — the raw
// USDC.e sits in that clone, not in the adapter or ConditionalTokens. Enumerate
// markets via MarketPrepared, resolve each clone via wcolOf, and sum its balance.
const MARKET_PREPARED = 'event MarketPrepared(uint64 seq, bytes32 indexed marketId, uint8 questionCount)'

// Every VaultFactory event that mutates a vault's USDC.e ledger carries the absolute
// post-op balance and a monotonic `seq`, so the latest event per vault gives its
// current balance — no per-vault balanceOf needed.
const LEDGER_EVENTS = [
  // events carrying an explicit `token` → keep only USDC.e
  { abi: 'event DepositedERC20(uint64 seq, address indexed vault, address indexed from, address indexed token, uint256 amount, uint256 ledgerAfter)', bal: 'ledgerAfter', token: 'token' },
  { abi: 'event WithdrawnERC20(uint64 seq, address indexed vault, address indexed to, address indexed token, uint256 amount, uint256 ledgerAfter)', bal: 'ledgerAfter', token: 'token' },
  { abi: 'event EmergencyExecuted(uint64 seq, address indexed vault, address indexed token, uint256 amount, uint256 ledgerAfter)', bal: 'ledgerAfter', token: 'token' },
  { abi: 'event VaultERC20BalanceChanged(uint64 seq, address indexed vault, address indexed token, uint256 balanceAfter, bytes4 reason)', bal: 'balanceAfter', token: 'token' },
  // collateral-only events (no token field) → always USDC.e
  { abi: 'event PositionSplit(uint64 seq, address indexed vault, bytes32 indexed conditionId, uint256 amount, uint256 ledgerAfter)', bal: 'ledgerAfter' },
  { abi: 'event PositionsMerged(uint64 seq, address indexed vault, bytes32 indexed conditionId, uint256 amount, uint256 ledgerAfter)', bal: 'ledgerAfter' },
  { abi: 'event PositionRedeemed(uint64 seq, address indexed vault, bytes32 indexed conditionId, uint256 payout, uint256 ledgerAfter)', bal: 'ledgerAfter' },
]

async function tvl(api) {
  const latest = {} // vault => { seq, bal } — newest USDC.e ledger value per vault

  for (const ev of LEDGER_EVENTS) {
    // distinct extraKey per event: getLogs caches by chain/target only, so without it
    // the events would share one cache file and cross-contaminate.
    const name = ev.abi.slice(6, ev.abi.indexOf('('))
    const logs = await getLogs2({ api, target: VAULT_FACTORY, eventAbi: ev.abi, fromBlock: FROM_BLOCK, extraKey: name })
    for (const log of logs) {
      if (ev.token && log[ev.token].toLowerCase() !== USDC_E) continue
      const seq = Number(log.seq)
      if (!latest[log.vault] || seq > latest[log.vault].seq)
        latest[log.vault] = { seq, bal: log[ev.bal] }
    }
  }

  // idle USDC.e across all vaults
  for (const { bal } of Object.values(latest)) api.add(USDC_E, bal)

  // + collateral locked in ConditionalTokens (single read, no multicall)
  const ct = await api.call({ abi: 'erc20:balanceOf', target: USDC_E, params: [CONDITIONAL_TOKENS] })
  api.add(USDC_E, ct)

  // neg-risk collateral: sum USDC.e across every market's WrappedCollateral clone
  // (single calls — ADI has no Multicall3 with tryAggregate)
  const marketLogs = await getLogs2({ api, target: NEG_RISK_ADAPTER, eventAbi: MARKET_PREPARED, fromBlock: NEG_RISK_FROM_BLOCK, extraKey: 'MarketPrepared' })
  const wcols = await Promise.all(marketLogs.map(l =>
    api.call({ abi: 'function wcolOf(bytes32) view returns (address)', target: NEG_RISK_ADAPTER, params: [l.marketId] })))
  const clones = wcols.filter(a => a && BigInt(a) !== 0n)
  const wcolBalances = await Promise.all(clones.map(c =>
    api.call({ abi: 'erc20:balanceOf', target: USDC_E, params: [c] })))
  for (const bal of wcolBalances) api.add(USDC_E, bal)

  // USDC.e is a brand-new-chain token DefiLlama can't auto-price; the adi entry in
  // tokenMapping.js maps it to usd-coin. Apply that transform to the balances.
  return getFixBalances('adi')(api.getBalances())
}

module.exports = {
  methodology:
    'TVL is the USDC.e (bridged USDC) collateral held by PredictStreet: per-vault balances ' +
    'reconstructed from VaultFactory events (each emits the absolute post-op ledger balance with a ' +
    'monotonic seq; the latest event per vault is its current balance), plus collateral locked in ' +
    'the ConditionalTokens contract, plus the USDC.e backing each neg-risk market (held in that ' +
    "market's WrappedCollateral clone).",
  adi: { tvl },
}
