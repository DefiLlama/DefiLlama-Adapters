const {usdCompoundExports} = require('../helper/compound');

const unitroller_bsc = "0x4f92913b86d5e79593fa2e475a8232b22ef17ed1"

const abis = {
  oracle: "address:getRegistry",
  underlyingPrice: "function getPriceForUnderling(address cToken) view returns (uint256)",
}

const lendingMarket = usdCompoundExports(unitroller_bsc, "bsc", "0xE6DFC9b2b8714043aA91079F5aed4024e0931027", abis)


module.exports = {
  timetravel: true,
  doublecounted: false,
  misrepresentedTokens: true,
  bsc:{
    tvl: lendingMarket.tvl,
    borrowed: lendingMarket.borrowed
  },
  methodology: "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending.. TVL is calculated by getting the market addresses from comptroller and calling the getCash() on-chain method to get the amount of tokens locked in each of these addresses, then we get the price of each token from coingecko. To view the Borrowed amounts along with the currently liquidity, click the 'Borrowed' check box",
}