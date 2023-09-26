const {compoundExports2} = require('../helper/compound');

const unitroller_bsc = "0x4f92913b86d5e79593fa2e475a8232b22ef17ed1"

module.exports = {
  bsc:compoundExports2({ comptroller: unitroller_bsc}),
  methodology: "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending.. TVL is calculated by getting the market addresses from comptroller and calling the getCash() on-chain method to get the amount of tokens locked in each of these addresses, then we get the price of each token from coingecko. To view the Borrowed amounts along with the currently liquidity, click the 'Borrowed' check box",
}