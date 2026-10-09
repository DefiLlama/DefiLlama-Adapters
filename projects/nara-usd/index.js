const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// NaraUSD is fully collateralised. The collateral sits in three on-chain places:
// deposits that have not yet been deployed (held by the MultiCollateralToken and
// the NaraUSD contract), and deployed positions (held by the protocol Safe).
const COLLATERAL_SAFE = '0xaB05c0DB9D26e96A9dcEDCAFCA23341316F6fe6F'
const MCT = '0x4eD90999f558Fdc28606b7F7f9AFc7044befb803' // MultiCollateralToken
const NARAUSD = '0x5C6263904CCFD3Bcf1aAa6e7063dDd29743b3Bb7'
const NARAUSD_PLUS = '0x1aa23CDFC941f6b54251C72012A9Bfa4bF5394D6'

const COLLATERAL_OWNERS = [COLLATERAL_SAFE, MCT, NARAUSD]

// Collateral tokens that DefiLlama already prices. MCT is deliberately absent:
// it is a claim on this same collateral, so counting it would double the TVL.
const MGLOBAL = '0x7433806912Eae67919e66aea853d46Fa0aef98A8' // Midas Fasanara Global
const COLLATERAL_TOKENS = [
  ADDRESSES.ethereum.USDT,
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.sUSDS,
  MGLOBAL,
]

// Blackopal LiquidStone II: a BoringVault share (6dp) with no market price, so
// it is unwrapped to its base asset with the vault accountant on-chain rate.
const BLACKOPAL_LS2 = '0x15e2579B1F0cBe973889a76826D3a2313b6509c6'
const BLACKOPAL_ACCOUNTANT = '0xda594876BA13BCC22065E03fFcFB24A22E5c6724' // AccountantWithRateProviders
const BLACKOPAL_BASE_ASSET = ADDRESSES.ethereum.USDC
// getRate() is 18-decimal (verified on-chain: 1.1358e18 at 2026-08-26), while the
// share token is 6-decimal, so the product is scaled back down by 1e18 and the
// result is already in the 6-decimal base asset.
const RATE_SCALE = 10n ** 18n

module.exports = {
  // The Blackopal vault share has no DefiLlama price and is reported as its
  // USDC-denominated value, so the token breakdown shows USDC in its place.
  misrepresentedTokens: true,
  // Part of the collateral is held in Midas Fasanara Global and sUSDS, which are
  // already counted by the Midas and Sky adapters.
  doublecounted: true,
  methodology:
    'TVL is the collateral backing NaraUSD. Collateral is held in three places: the protocol Safe (0xaB05c0DB9D26e96A9dcEDCAFCA23341316F6fe6F), which holds the deployed positions, and the MultiCollateralToken and NaraUSD contracts, which hold deposits that have not been deployed yet. USDT, USDC, sUSDS and Midas Fasanara Global (mGLOBAL) balances are counted at their DefiLlama price. Blackopal LiquidStone II is an off-chain credit position represented by a BoringVault share; it is valued in USDC using getRate on the vault accountant. The MultiCollateralToken itself is excluded because it is a claim on the same collateral. doublecounted is set because mGLOBAL and sUSDS are also counted under the Midas and Sky adapters.',
  ethereum: {
    tvl: async api => {
      await sumTokens2({ api, owners: COLLATERAL_OWNERS, tokens: COLLATERAL_TOKENS })

      const [shares, rate] = await Promise.all([
        api.multiCall({
          abi: 'erc20:balanceOf',
          calls: COLLATERAL_OWNERS.map(owner => ({ target: BLACKOPAL_LS2, params: owner })),
        }),
        api.call({ abi: 'uint256:getRate', target: BLACKOPAL_ACCOUNTANT }),
      ])
      const totalShares = shares.reduce((sum, balance) => sum + BigInt(balance), 0n)
      api.add(BLACKOPAL_BASE_ASSET, (totalShares * BigInt(rate)) / RATE_SCALE)
    },
  },
}
