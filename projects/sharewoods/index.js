const ADDRESSES = require('../helper/coreAssets.json')
const abi = require('../helper/abis/morpho.json')
const { request, gql } = require('graphql-request')

// Sharewoods — Morpho Blue + Vault V2 markets on Robinhood Chain.
// Loan-side TVL: vault totalAssets (idle USDG + USDG allocated to Morpho).
// Collateral TVL: Morpho API market-scoped state.collateralAssets per Sharewoods
// marketId (Morpho Blue has no on-chain market-level collateral total, and the
// same collateral ERC-20s are shared across non-Sharewoods markets on Morpho).

const MORPHO = '0x9D53d5E3bd5E8d4Cbfa6DB1ca238AEA02E651010'
const USDG = ADDRESSES.robinhood.USDG
const CHAIN_ID = 4663
const MORPHO_API = 'https://blue-api.morpho.org/graphql'

const VAULTS = [
  '0x5FE15021a7C0Ff4A9965b400E474f616451BA128', // Sharewoods RWA USDG
  '0xf8f8654A26bfe134ee290d0b6a749Ba45F03a104', // Sharewoods Classic USDG
]

const MARKETS = [
  { id: '0x3ce44383b860237d3a78a88caf9edcbec36b040d7be2998ef8222eec8719bd48', collateral: '0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC' }, // NVDA
  { id: '0xd621b5373890ce0be9b20ca17a75c57944e8dbb997172fd61e1ea48af63fad96', collateral: '0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9' }, // AAPL
  { id: '0x2cedec528cb3c02b27986d8e2e1cefb35d1ee39ceb268f2e0c4e55179224216d', collateral: '0x322F0929c4625eD5bAd873c95208D54E1c003b2d' }, // TSLA
  { id: '0xe4f745e6620e169ee2664111e61e448d2e0d58ea0129fd5fb0db940f5e0f801b', collateral: '0x117cc2133c37B721F49dE2A7a74833232B3B4C0C' }, // SPY
  { id: '0x325fc8e0610ad5403445c01009e6ab488082a24d61c1dfbd4b8f55184a2eb228', collateral: '0x2e0847E8910a9732eB3fb1bb4b70a580ADAD4FE3' }, // GOOGL
  { id: '0xb6de0ed9198b5a23f3f22ea1f3b9dc5abee8f676c241e04dc77783ec38ca4ce6', collateral: ADDRESSES.robinhood.WETH }, // ETH
]

const marketsQuery = gql`
  query SharewoodsMarkets($chainId: Int!) {
    ${MARKETS.map((m, i) => `
      m${i}: marketById(marketId: "${m.id}", chainId: $chainId) {
        marketId
        collateralAsset { address }
        state { collateralAssets }
      }
    `).join('\n')}
  }
`

async function tvl(api) {
  const totals = await api.multiCall({
    abi: 'uint256:totalAssets',
    calls: VAULTS,
  })
  api.add(USDG, totals)

  // Fail closed if on-chain market params disagree with the configured collateral.
  const params = await api.multiCall({
    target: MORPHO,
    abi: abi.morphoBlueFunctions.idToMarketParams,
    calls: MARKETS.map((m) => m.id),
  })
  MARKETS.forEach((market, i) => {
    const p = params[i]
    if (!p?.collateralToken ||
      p.collateralToken.toLowerCase() !== market.collateral.toLowerCase()) {
      throw new Error(`Invalid Sharewoods Morpho market configuration: ${market.id}`)
    }
  })

  const data = await request(MORPHO_API, marketsQuery, { chainId: CHAIN_ID })
  MARKETS.forEach((market, i) => {
    const row = data[`m${i}`]
    if (!row?.state || !row.collateralAsset?.address) {
      throw new Error(`Missing Morpho API market state for Sharewoods market: ${market.id}`)
    }
    if (row.collateralAsset.address.toLowerCase() !== market.collateral.toLowerCase()) {
      throw new Error(`Morpho API collateral mismatch for Sharewoods market: ${market.id}`)
    }
    api.add(market.collateral, row.state.collateralAssets)
  })

  // Do not also add Morpho totalSupplyAssets — that USDG is already inside vault totalAssets.
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is USDG managed by the Sharewoods RWA and Classic Earn vaults (Vault V2 totalAssets, including idle cash and USDG allocated into Morpho) plus collateral locked in Sharewoods Morpho Blue markets. Collateral is read market-by-market from the Morpho API (state.collateralAssets) for each Sharewoods marketId, because Morpho Blue has no on-chain market-level collateral total and the same collateral tokens are used by non-Sharewoods markets on the same Morpho instance. MarketIds are cross-checked on-chain via idToMarketParams.',
  robinhood: {
    tvl,
    start: '2026-07-29',
  },
}
