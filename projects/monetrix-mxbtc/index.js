// https://hyperevmscan.io/address/0x929f664f6662Aa18c64E52ecf3e16c6649049d55
const BTC_ACCOUNTANT = '0x929f664f6662Aa18c64E52ecf3e16c6649049d55'
const UBTC = '0x9FDBdA0A5e284c32744D2f17Ee5c74B284993463'

// First deposit into the current deployment: 2026-10-13 11:55:17 UTC.
// https://hyperevmscan.io/tx/0x5b7f1715ad0a90bfdcdb8b3e8039bb798c773414e765f8c49d5ea20b41fea8ba
const START_TIMESTAMP = 1791892517

async function tvl(api) {
  if (api.timestamp && api.timestamp < START_TIMESTAMP) return

  // BtcAccountant returns net backing in EVM UBTC units (8 decimals),
  // including HyperCore collateral and subtracting borrow liabilities.
  const backing = await api.call({
    target: BTC_ACCOUNTANT,
    abi: 'function totalBackingSigned() view returns (int256)',
  })
  if (BigInt(backing) > 0n) api.add(UBTC, backing)
}

module.exports = {
  // HyperCore read precompiles do not provide reliable historical state.
  // https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/hyperevm/json-rpc
  timetravel: false,
  // The accountant expresses the entire net equity, including the HYPE/USDC
  // strategy overlay, in UBTC; use the existing UBTC price for that value.
  misrepresentedTokens: true,
  methodology:
    'TVL is the net collateral backing mxBTC, read on-chain from BtcAccountant.totalBackingSigned ' +
    'in 8-decimal UBTC units: UBTC in the BtcVault and RedeemEscrow on HyperEVM plus the ' +
    'Vault\'s HyperCore spot, supplied collateral and perpetual account equity, net of borrow liabilities. ' +
    'The accountant converts non-BTC equity to UBTC using HyperCore prices. ' +
    'smxBTC receipt tokens, the protocol-owned insurance fund, instant-exit buffers and undistributed ' +
    'yield in YieldEscrow are excluded. Only the current deployment is tracked; USDM and mxHYPE ' +
    'are separate Monetrix products.',
  start: "2026-10-13",
  hyperliquid: { tvl },
}
