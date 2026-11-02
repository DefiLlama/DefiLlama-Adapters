const { getUniTVL } = require('../helper/unknownTokens')
const { withMonetrixBalances } = require('../helper/monetrix')

module.exports = {
  misrepresentedTokens: true,
  methodology: 'Token balances held by liquidity pools. sUSDM and smxHYPE are converted to USDM and mxHYPE with convertToAssets, then represented as their 1:1 standard redemption assets USDC and HYPE (WHYPE for pricing).',
  hyperliquid: {
    tvl: withMonetrixBalances(getUniTVL({
      factory: '0x32b9dA73215255d50D84FeB51540B75acC1324c2',
      fetchBalances: true,
      permitFailure: true,
      useDefaultCoreAssets: false,
      abis: { allPairsLength: 'uint256:allPoolsLength', allPairs: 'function allPools(uint) view returns (address)' },
    })),
  },
}
