const ADDRESSES = require('../helper/coreAssets.json')
const abi = require('../helper/abis/morpho.json')

// Sharewoods — Morpho Blue + Vault V2 markets on Robinhood Chain.
// Loan-side TVL uses vault totalAssets (idle USDG + USDG allocated to Morpho).
// Collateral TVL uses Morpho ERC-20 balances only for tokens exclusive to
// Sharewoods markets. Morpho Blue has no on-chain market-level collateral
// total, so shared collaterals (WETH) are omitted rather than summing the
// whole Morpho balanceOf (which can include non-Sharewoods markets).

const MORPHO = '0x9D53d5E3bd5E8d4Cbfa6DB1ca238AEA02E651010'
const USDG = ADDRESSES.robinhood.USDG

const VAULTS = [
  '0x5FE15021a7C0Ff4A9965b400E474f616451BA128', // Sharewoods RWA USDG
  '0xf8f8654A26bfe134ee290d0b6a749Ba45F03a104', // Sharewoods Classic USDG
]

// marketId → expected collateral. `exclusive: true` tokens are only used as
// collateral in these Sharewoods markets on this Morpho instance, so
// balanceOf(Morpho) is market-scoped in practice. WETH is not exclusive.
const MARKETS = [
  { id: '0x3ce44383b860237d3a78a88caf9edcbec36b040d7be2998ef8222eec8719bd48', collateral: '0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC', exclusive: true },  // NVDA
  { id: '0xd621b5373890ce0be9b20ca17a75c57944e8dbb997172fd61e1ea48af63fad96', collateral: '0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9', exclusive: true },  // AAPL
  { id: '0x2cedec528cb3c02b27986d8e2e1cefb35d1ee39ceb268f2e0c4e55179224216d', collateral: '0x322F0929c4625eD5bAd873c95208D54E1c003b2d', exclusive: true },  // TSLA
  { id: '0xe4f745e6620e169ee2664111e61e448d2e0d58ea0129fd5fb0db940f5e0f801b', collateral: '0x117cc2133c37B721F49dE2A7a74833232B3B4C0C', exclusive: true },  // SPY
  { id: '0x325fc8e0610ad5403445c01009e6ab488082a24d61c1dfbd4b8f55184a2eb228', collateral: '0x2e0847E8910a9732eB3fb1bb4b70a580ADAD4FE3', exclusive: true },  // GOOGL
  { id: '0xb6de0ed9198b5a23f3f22ea1f3b9dc5abee8f676c241e04dc77783ec38ca4ce6', collateral: ADDRESSES.robinhood.WETH, exclusive: false }, // ETH — omitted (shared)
]

async function tvl(api) {
  const totals = await api.multiCall({
    abi: 'uint256:totalAssets',
    calls: VAULTS,
  })
  api.add(USDG, totals)

  // Confirm marketIds resolve to the expected collateral tokens, then count
  // only exclusive collaterals held by Morpho (Sharewoods-only tokens).
  const params = await api.multiCall({
    target: MORPHO,
    abi: abi.morphoBlueFunctions.idToMarketParams,
    calls: MARKETS.map((m) => m.id),
  })

  const tokens = []
  MARKETS.forEach((market, i) => {
    if (!market.exclusive) return
    const p = params[i]
    if (!p || !p.collateralToken) return
    if (p.collateralToken.toLowerCase() !== market.collateral.toLowerCase()) return
    tokens.push(market.collateral)
  })

  // Do not also add Morpho totalSupplyAssets — that USDG is already inside vault totalAssets.
  return api.sumTokens({ owner: MORPHO, tokens })
}

module.exports = {
  methodology:
    'TVL is USDG managed by the Sharewoods RWA and Classic Earn vaults (Vault V2 totalAssets, including idle cash and USDG allocated into Morpho) plus stock-token collateral locked in Sharewoods Morpho Blue markets. Stock collaterals are counted as Morpho ERC-20 balances for tokens exclusive to Sharewoods marketIds (verified via idToMarketParams). WETH collateral on the Classic ETH market is omitted because Morpho Blue does not expose a market-level collateral total and WETH may be shared with non-Sharewoods markets on the same Morpho instance.',
  robinhood: {
    tvl,
    start: '2026-07-29',
  },
}
