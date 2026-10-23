// CURB - token launchpad on Base, live since 2026-10-16. https://curbfun.xyz , docs https://curbfun.xyz/docs.html ,
// source https://github.com/Curb-Dev/curb (verified on Sourcify).
// Every launch trades on its own bonding curve against one paired asset (WETH, USDC, cbBTC, VIRTUAL, AERO,
// tokenized stocks, ...). At its threshold the curve hands its whole reserve to a Uniswap v4 pool that carries
// CURB's FeeHook, and that LP is locked forever. Pool liquidity is Uniswap v4 TVL and is not counted here.

// Lists every launch, oldest first, append-only.
const LAUNCH_REGISTRY = '0x86e9a01F3959A96469051AE1a73D5C09b0BaC110'

// The registry's write-once record of a launch. At registration the registry checks that the curve's own token()
// and pairToken() match this record.
const LAUNCH_OF =
  'function launchOf(address launchToken) view returns ((address curve, address quoteToken, address beneficiary, address refundTo, uint256 reservedZero, uint24 fee, int24 tickSpacing, address hooks, uint16 totalTaxBps, uint16 platformBps, address platformRecipient, uint64 launchedAt))'

async function tvl(api) {
  const launchTokens = await api.fetchList({ target: LAUNCH_REGISTRY, lengthAbi: 'launchCount', itemAbi: 'launchAt' })
  const launches = await api.multiCall({ target: LAUNCH_REGISTRY, abi: LAUNCH_OF, calls: launchTokens })
  // realQuoteReserve() is the paired asset the curve holds for trading. It leaves out the trading fees not yet swept
  // to the platform and the creator, anything sent to the curve directly, and the curve's virtual reserve.
  // It is 0 once the launch has graduated.
  const reserves = await api.multiCall({ abi: 'uint256:realQuoteReserve', calls: launches.map((launch) => launch.curve) })
  api.add(launches.map((launch) => launch.quoteToken), reserves)
}

module.exports = {
  methodology:
    "TVL is the paired asset (WETH, USDC, cbBTC, tokenized stocks and the other assets CURB supports) held by CURB's bonding curves for trading. Launches are enumerated on-chain from the LaunchRegistry (launchCount, launchAt, launchOf), and each curve's realQuoteReserve() is summed. That reserve leaves out trading fees not yet swept to the platform and creators, tokens sent to a curve directly, and the curve's virtual reserve. Unsold launch tokens held by the curves are not counted. When a launch graduates, its reserve moves into a Uniswap v4 pool whose liquidity is locked forever. That liquidity is counted by Uniswap v4, not here, and a graduated curve reports 0.",
  start: '2026-10-17', // first full day: the LaunchRegistry was deployed on 2026-10-16 at 01:38 UTC (block 52662669)
  base: { tvl },
}
