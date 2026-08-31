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

// Collateral counted at face value. Only assets that are $1-denominated in
// their own right are listed here; every yield-bearing position below is
// unwrapped to its underlying with an on-chain rate instead, so nothing depends
// on DefiLlama holding a price for a wrapper token.
const COLLATERAL_TOKENS = [ADDRESSES.ethereum.USDT, ADDRESSES.ethereum.USDC]

// sUSDS is an ERC4626 vault over USDS. convertToAssets turns the share balance
// into the USDS it is redeemable for, which is the real value of the position.
const SUSDS = ADDRESSES.ethereum.sUSDS
const USDS = ADDRESSES.ethereum.USDS

// Midas Fasanara Global. Valued from Midas' own price feed rather than left to
// generic pricing, so the number is exact and independent of whether DefiLlama
// tracks this token.
const MGLOBAL = '0x7433806912Eae67919e66aea853d46Fa0aef98A8'
const MGLOBAL_DECIMALS = 18n
const MGLOBAL_FEED = '0x66Aa9fcD63DF74e1f67A9452E6E59Fbc67f75E38' // MGlobalCustomAggregatorFeedGrowth

// Blackopal LiquidStone II: a BoringVault share (6dp) with no market price, so
// it is unwrapped to its base asset with the vault accountant on-chain rate.
const BLACKOPAL_LS2 = '0x15e2579B1F0cBe973889a76826D3a2313b6509c6'
const BLACKOPAL_ACCOUNTANT = '0xda594876BA13BCC22065E03fFcFB24A22E5c6724' // AccountantWithRateProviders
const BLACKOPAL_BASE_ASSET = ADDRESSES.ethereum.USDC
// getRate() is 18-decimal (verified on-chain: 1.1358e18 at 2026-08-26), while the
// share token is 6-decimal, so the product is scaled back down by 1e18 and the
// result is already in the 6-decimal base asset.
const RATE_SCALE = 10n ** 18n

// MCT is a claim on the same collateral counted above, so it must never be
// added itself. The rest are unsolicited airdrops sent to protocol addresses.
const EXCLUDED = [
  MCT,
  '0xf9E1B5cC516d8A2a58A337bA6E0271e7bA7DC2f8', // USDGift.cc
  '0xB72A82B0F73fB6c0Fca392F09BBCBcCaa56dDcA8', // WorldCupAI.pro
  '0x1a347835bc2a7C64094767bE34216631B273Bd87', // AIMevBot.cc
  '0xdf40b862465cB3C963FEab7e235519e37D9eB347', // FiFaAI.cc
  '0xa9a4D09D3f8F6956D55A47eeEf10a1a99df97f97', // ha138com
  '0x6051C1354Ccc51b4d561e43b02735DEaE64768B8', // yRise (dust)
]

module.exports = {
  // Positions with no DefiLlama price - Midas Fasanara Global, the Blackopal
  // vault share, and NaraUSD itself - are unwrapped to their underlying value
  // and reported against a priced stable, so the token breakdown shows the
  // proxy asset rather than the original.
  misrepresentedTokens: true,
  // Part of the collateral is held in Midas Fasanara Global. The Midas adapter
  // reports the navUsd of its endorsed vaults on Ethereum, which includes the
  // assets backing the mGLOBAL that Nara holds, so the same dollars are counted
  // in both adapters.
  doublecounted: true,
  methodology:
    'TVL is the collateral backing NaraUSD, measured on-chain. Collateral is held in three places: the protocol Safe (0xaB05c0DB9D26e96A9dcEDCAFCA23341316F6fe6F), which holds the deployed positions, and the MultiCollateralToken and NaraUSD contracts, which hold deposits that have not been deployed yet. USDT and USDC are counted at face value. Every yield-bearing position is unwrapped to its underlying using an on-chain rate rather than relying on a price for the wrapper: sUSDS via convertToAssets on the sUSDS ERC4626 vault, giving redeemable USDS; Midas Fasanara Global via the Midas price feed lastAnswer, with feed decimals read on-chain; and Blackopal LiquidStone II via getRate on the vault accountant. The MultiCollateralToken itself is excluded because it is a claim on the same collateral. Staking is the NaraUSD deposited in the NaraUSD+ vault; it is reported separately and not added to TVL, because those NaraUSD are already part of NaraUSD supply and backed by the same collateral. doublecounted is set because part of the collateral is held in Midas Fasanara Global: the Midas adapter reports the NAV of its endorsed vaults on Ethereum, which includes the assets backing the mGLOBAL held here, so that position is counted under Midas as well.',
  ethereum: {
    tvl: async api => {
      await sumTokens2({
        api,
        owners: COLLATERAL_OWNERS,
        tokens: COLLATERAL_TOKENS,
        blacklistedTokens: EXCLUDED,
      })

      const [shares, rate, mglobalBalances, mglobalAnswer, mglobalFeedDecimals] =
        await Promise.all([
          api.multiCall({
            abi: 'erc20:balanceOf',
            calls: COLLATERAL_OWNERS.map(owner => ({ target: BLACKOPAL_LS2, params: owner })),
          }),
          api.call({ abi: 'uint256:getRate', target: BLACKOPAL_ACCOUNTANT }),
          api.multiCall({
            abi: 'erc20:balanceOf',
            calls: COLLATERAL_OWNERS.map(owner => ({ target: MGLOBAL, params: owner })),
          }),
          api.call({ abi: 'int256:lastAnswer', target: MGLOBAL_FEED }),
          api.call({ abi: 'uint8:decimals', target: MGLOBAL_FEED }),
        ])

      const susdsShares = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: COLLATERAL_OWNERS.map(owner => ({ target: SUSDS, params: owner })),
      })
      const totalSusds = susdsShares.reduce((sum, balance) => sum + BigInt(balance), 0n)
      if (totalSusds > 0n) {
        const usdsValue = await api.call({
          abi: 'function convertToAssets(uint256) view returns (uint256)',
          target: SUSDS,
          params: totalSusds.toString(),
        })
        api.add(USDS, usdsValue)
      }

      const totalShares = shares.reduce((sum, balance) => sum + BigInt(balance), 0n)
      api.add(BLACKOPAL_BASE_ASSET, (totalShares * BigInt(rate)) / RATE_SCALE)

      // MGLOBAL (18dp) * feed answer -> value denominated in the 6dp base asset.
      // Feed decimals are read on-chain rather than assumed.
      const totalMglobal = mglobalBalances.reduce((sum, balance) => sum + BigInt(balance), 0n)
      const feedScale = 10n ** BigInt(mglobalFeedDecimals)
      const decimalsAdjust = 10n ** (MGLOBAL_DECIMALS - 6n)
      api.add(
        BLACKOPAL_BASE_ASSET,
        (totalMglobal * BigInt(mglobalAnswer)) / feedScale / decimalsAdjust
      )
    },

    staking: async api => {
      // NaraUSD has no price on DefiLlama yet (this listing is what creates it),
      // so summing it directly returns zero. It is fully collateralised 1:1 by
      // the assets counted in tvl above, so it is represented here by USDC for
      // valuation only - hence misrepresentedTokens. NaraUSD is 18dp, USDC 6dp.
      const staked = await api.call({
        abi: 'erc20:balanceOf',
        target: NARAUSD,
        params: NARAUSD_PLUS,
      })
      api.add(ADDRESSES.ethereum.USDC, BigInt(staked) / 10n ** 12n)
    },
  },
}
