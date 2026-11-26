// Stoxes.fun bonding-curve launchpad on BNB Chain (https://stoxes.fun)
// Deployments, from the deployment registry in the stoxes.fun frontend bundle.
// Current Portal source (verified): https://sourcify.dev/server/v2/contract/56/0x5515ec89047e91ed6f639f23fddf784293cdfcb5
const deployments = [
  { factory: '0xdfb1afc6dabcbc23e5a3fd09c8a0137112f58f96', portal: '0xbe446b5baaaa003121b1196b01a1476a1ccaacc0' }, // legacy, launches closed
  { factory: '0x9b8b27cbfde73289f1e65065df4712e91241588f', portal: '0x5515ec89047e91ed6f639f23fddf784293cdfcb5' }, // current
]
// (kind, quoteToken, graduated, finalized, sold, quoteReserve). BNB-quoted tokens report WBNB as quote.
const tokenStateAbi = 'function tokenState(address) view returns (uint8 kind, address quoteToken, bool graduated, bool finalized, uint256 sold, uint256 quoteReserve)'

// The factories expose allTokens(uint256) with no length getter, so read in batches until a call reverts
async function getAllTokens(api, factory) {
  const tokens = []
  const BATCH = 50
  for (let i = 0; ; i += BATCH) {
    const res = await api.multiCall({ target: factory, abi: 'function allTokens(uint256) view returns (address)', calls: Array.from({ length: BATCH }, (_, j) => i + j), permitFailure: true })
    const found = res.filter(Boolean)
    tokens.push(...found)
    if (found.length < BATCH) break
  }
  return tokens
}

async function tvl(api) {
  for (const { factory, portal } of deployments) {
    const tokens = await getAllTokens(api, factory)
    const states = await api.multiCall({ target: portal, abi: tokenStateAbi, calls: tokens, permitFailure: true })
    states.forEach((s) => {
      if (!s || s.graduated) return // graduated liquidity belongs to PancakeSwap
      api.add(s.quoteToken, s.quoteReserve)
    })
  }
}

module.exports = {
  methodology: 'Counts the real quote reserves (BNB and Binance tokenized stocks such as BNCB, NVDAB, SPCXB) held by the Stoxes.fun Portals for tokens still on their bonding curve, read from Portal.tokenState. Graduated liquidity on PancakeSwap, launched-token inventory, fees, tax escrows and creator buckets are excluded.',
  start: '2026-10-20',
  bsc: { tvl },
}
