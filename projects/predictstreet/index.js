const { getLogs2 } = require('../helper/cache/getLogs')
const { getFixBalances } = require('../helper/portedTokens')

// Bridged USDC (USDC.e), 6 decimals — the collateral that backs every position.
const USDC_E = '0x9cb8142aebbcdc60af7c97af897a67a8f3ca71c2'

const VAULT_FACTORY = '0xc16B8b190064451c2FeEb2e77c4B2aC4c7009552'
const CONDITIONAL_TOKENS = '0xD28B8295Cd57F205e4d080Ff4c6d23C06a9EEe3a' // locks collateral backing open positions
const NEG_RISK_ADAPTER = '0x29e58C3916d1fD235f3d1e7fCF640fd1fA8BDb1e'
// ADI's multicall implements only aggregate3 (no tryAggregate), so the SDK's
// automatic multiCall/sumTokens routing can't use it — we call aggregate3
// directly as a plain contract call instead.
const MULTICALL = '0x73df6E8F0D112D22bD672952323b43d6893AB6D2'
const FROM_BLOCK = 32200            // VaultFactory deploy
const NEG_RISK_FROM_BLOCK = 32196   // NegRiskAdapter deploy

// One event per vault, used only to enumerate vaults — balances are read live
// (this RPC caps getLogs responses, so dense event scans are unreliable).
const VAULT_CREATED = 'event VaultCreated(uint64 seq, address indexed owner, address indexed vault)'
// Neg-risk markets wrap USDC.e into a per-market WrappedCollateral clone — the raw
// USDC.e sits in that clone, not in the adapter or ConditionalTokens.
const MARKET_PREPARED = 'event MarketPrepared(uint64 seq, bytes32 indexed marketId, uint8 questionCount)'

const AGGREGATE3_ABI = 'function aggregate3((address target, bool allowFailure, bytes callData)[] calls) payable returns ((bool success, bytes returnData)[] returnData)'
const SELECTORS = {
  ledgerERC20: '0xd3cc7c57', // ledgerERC20(address)
  balanceOf: '0x70a08231',   // balanceOf(address)
  wcolOf: '0x40ece17a',      // wcolOf(bytes32)
}

// Batched read-only calls; returns one returnData hex (or null) per call, in order.
async function aggregate3(api, calls, batchSize = 500) {
  const out = []
  for (let i = 0; i < calls.length; i += batchSize) {
    const res = await api.call({ abi: AGGREGATE3_ABI, target: MULTICALL, params: [calls.slice(i, i + batchSize)] })
    for (const r of res) out.push(r.success && r.returnData !== '0x' ? r.returnData : null)
  }
  return out
}

const encodeArg = (hex) => hex.replace(/^0x/, '').padStart(64, '0').toLowerCase()

async function tvl(api) {
  // (1) idle USDC.e across all user vaults: enumerate vaults via VaultCreated,
  // then read each vault's live internal USDC.e ledger. ledgerERC20 (not
  // balanceOf) so stray direct transfers that no user deposited are excluded.
  const created = await getLogs2({ api, target: VAULT_FACTORY, eventAbi: VAULT_CREATED, fromBlock: FROM_BLOCK, extraKey: 'VaultCreated' })
  const vaults = [...new Set(created.map(l => l.vault))]
  const ledgerData = SELECTORS.ledgerERC20 + encodeArg(USDC_E)
  const ledgers = await aggregate3(api, vaults.map(v => [v, true, ledgerData]))
  for (const bal of ledgers) if (bal) api.add(USDC_E, BigInt(bal).toString())

  // (2) collateral locked in ConditionalTokens (binary markets)
  const ct = await api.call({ abi: 'erc20:balanceOf', target: USDC_E, params: [CONDITIONAL_TOKENS] })
  api.add(USDC_E, ct)

  // (3) neg-risk collateral: USDC.e held by every market's WrappedCollateral clone
  const marketLogs = await getLogs2({ api, target: NEG_RISK_ADAPTER, eventAbi: MARKET_PREPARED, fromBlock: NEG_RISK_FROM_BLOCK, extraKey: 'MarketPrepared' })
  const wcols = await aggregate3(api, marketLogs.map(l => [NEG_RISK_ADAPTER, true, SELECTORS.wcolOf + encodeArg(l.marketId)]))
  const clones = wcols.filter(a => a && BigInt(a) !== 0n).map(a => '0x' + a.slice(26))
  const wcolBalances = await aggregate3(api, clones.map(c => [USDC_E, true, SELECTORS.balanceOf + encodeArg(c)]))
  for (const bal of wcolBalances) if (bal) api.add(USDC_E, BigInt(bal).toString())

  // USDC.e is a brand-new-chain token DefiLlama can't auto-price; the adi entry in
  // tokenMapping.js maps it to usd-coin. Apply that transform to the balances.
  return getFixBalances('adi')(api.getBalances())
}

module.exports = {
  methodology:
    'TVL is the USDC.e (bridged USDC) collateral held by PredictStreet: the live internal ' +
    'USDC.e ledger of every user vault (vaults enumerated via VaultCreated events, balances ' +
    'read on-chain in batches), plus collateral locked in the ConditionalTokens contract, plus ' +
    "the USDC.e backing each neg-risk market (held in that market's WrappedCollateral clone).",
  adi: { tvl },
}
