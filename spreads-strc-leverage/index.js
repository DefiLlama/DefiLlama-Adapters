// STRC Leverage — isolated market on the Spreads money market (Ink Mainnet)
const MONEY_MARKET = '0x1256bC6D44a4BAf5C67712e3EA6eD1b02758Fb9f'
const MARKET_ID = '0xd2e42f4511e1ab2d2653d7adc26a31d97987ddd2478792175e10ac750f73fbc8'
const USDC = '0x2D270e6886d130D724215A266106e6832161EAEd'
const STRCx = '0x546E01d65f2B1C64C657bD69Ce00f8584Ed798cc'
const ORACLE = '0xf577096700092653EcB4C24aBc33A4F9aeb98944'

const MARKET_ABI =
  'function market(bytes32) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)'

const SCALE_1E36 = 10n ** 36n

async function getMarket(api) {
  const res = await api.call({ target: MONEY_MARKET, abi: MARKET_ABI, params: [MARKET_ID] })
  return {
    totalSupplyAssets: BigInt(res.totalSupplyAssets ?? res[0]),
    totalBorrowAssets: BigInt(res.totalBorrowAssets ?? res[2]),
  }
}

module.exports = {
  methodology:
    'TVL is the STRCx collateral deposited plus available USDC liquidity (total USDC supplied minus total USDC borrowed) in the Spreads STRC Leverage market on Ink. STRCx collateral is priced in USDC via the market oracle.',
  ink: {
    tvl: async (api) => {
      const { totalSupplyAssets, totalBorrowAssets } = await getMarket(api)
      const usdcLiquidity = totalSupplyAssets - totalBorrowAssets
      api.add(USDC, usdcLiquidity.toString())

      const [collateral, price] = await Promise.all([
        api.call({ abi: 'erc20:balanceOf', target: STRCx, params: [MONEY_MARKET] }),
        api.call({ target: ORACLE, abi: 'function price() view returns (uint256)' }),
      ])
      // Oracle returns price scaled to 10^(36 + loanDec - collateralDec),
      // so loan_raw = collateral_raw * price / 1e36.
      const strcxInUsdc = (BigInt(collateral) * BigInt(price)) / SCALE_1E36
      api.add(USDC, strcxInUsdc.toString())
    },
    borrowed: async (api) => {
      const { totalBorrowAssets } = await getMarket(api)
      api.add(USDC, totalBorrowAssets.toString())
    },
  },
}
