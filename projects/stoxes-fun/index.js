// Stoxes.fun bonding-curve launchpad on BNB Chain (https://stoxes.fun)
// Deployments, from the deployment registry in the stoxes.fun frontend bundle.
// Current Portal source (verified): https://sourcify.dev/server/v2/contract/56/0x5515ec89047e91ed6f639f23fddf784293cdfcb5
const { sumTokens2 } = require('../helper/unwrapLPs')

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
  const tokensAndOwners = []
  for (const { factory, portal } of deployments) {
    const tokens = await getAllTokens(api, factory)
    const states = await api.multiCall({ target: portal, abi: tokenStateAbi, calls: tokens })
    // tokenState is only used to discover the quote tokens; the Portal's balance of each is what is counted
    states.forEach((s) => tokensAndOwners.push([s.quoteToken, portal]))
  }
  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  methodology: 'Counts the quote tokens (BNB and Binance tokenized stocks such as BNCB, NVDAB, SPCXB) held by the Stoxes.fun Portals. Quote tokens are discovered from Portal.tokenState for every token the factories have launched. Graduated liquidity on PancakeSwap and launched-token inventory are excluded.',
  start: '2026-10-20',
  bsc: { tvl },
}
