const ADDRESSES = require('../helper/coreAssets.json')

// Sharewoods — Morpho Blue + Vault V2 markets on Robinhood Chain.
// Earn vaults (RWA + Classic) hold/allocate USDG; borrowers lock stock/ETH
// collateral in Sharewoods Morpho markets. Morpho Blue already counts the
// underlying market balances, so this listing is marked doublecounted.

const MORPHO = '0x9D53d5E3bd5E8d4Cbfa6DB1ca238AEA02E651010'
const USDG = ADDRESSES.robinhood.USDG

const VAULTS = [
  '0x5FE15021a7C0Ff4A9965b400E474f616451BA128', // Sharewoods RWA USDG
  '0xf8f8654A26bfe134ee290d0b6a749Ba45F03a104', // Sharewoods Classic USDG
]

// Collateral tokens for Sharewoods Morpho markets (unique to these markets today).
const COLLATERALS = [
  '0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC', // NVDA
  '0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9', // AAPL
  '0x322F0929c4625eD5bAd873c95208D54E1c003b2d', // TSLA
  '0x117cc2133c37B721F49dE2A7a74833232B3B4C0C', // SPY
  '0x2e0847E8910a9732eB3fb1bb4b70a580ADAD4FE3', // GOOGL
  ADDRESSES.robinhood.WETH,                     // ETH market
]

async function tvl(api) {
  const totals = await api.multiCall({
    abi: 'uint256:totalAssets',
    calls: VAULTS,
  })
  api.add(USDG, totals)

  // Do not also add Morpho totalSupplyAssets — that USDG is already inside vault totalAssets.
  return api.sumTokens({ owner: MORPHO, tokens: COLLATERALS })
}

module.exports = {
  doublecounted: true,
  methodology:
    'TVL is USDG managed by the Sharewoods RWA and Classic Earn vaults (ERC-4626/Vault V2 totalAssets, including idle cash and USDG allocated into Morpho) plus stock/ETH collateral locked in Sharewoods Morpho Blue markets (token balances held by Morpho). Marked doublecounted because Morpho Blue already counts the same loan and collateral balances.',
  robinhood: {
    tvl,
    start: '2026-07-29',
  },
}
