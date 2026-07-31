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
  { id: '0xba2956531697f0c0b0b9db7b2d3148581ae69610c136287ba84bf519621a22dd', collateral: '0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC' }, // NVDA
  { id: '0x01ab931866f6753d9246d451284c03d2b9cdf7f351120bc2e79045941777e7aa', collateral: '0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9' }, // AAPL
  { id: '0xc6a3f6238a3ac2db25af6a392ba974087717bc837e00dc7177172999b85afd5f', collateral: '0x322F0929c4625eD5bAd873c95208D54E1c003b2d' }, // TSLA
  { id: '0xc78a7b86f102a8a5ead69355beecaa20f726de9530c6fe193429bd4ee29300f6', collateral: '0x117cc2133c37B721F49dE2A7a74833232B3B4C0C' }, // SPY
  { id: '0x4804ceda06fea535ce9a60253410b41cbcf76fa5e07997488c6e2089c8c68477', collateral: '0x2e0847E8910a9732eB3fb1bb4b70a580ADAD4FE3' }, // GOOGL
  { id: '0x1cfad1ebbc2be30c0d464c70c0057760a4c06308ead68bbee575471f1e35553d', collateral: ADDRESSES.robinhood.WETH }, // ETH
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
