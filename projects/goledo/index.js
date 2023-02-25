const { aaveV2Export } = require('../helper/aave');

module.exports = {
  conflux: aaveV2Export('0x9aeba63d77d25c95dadd057db74741517862f360'),
  methodology: "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending.. TVL is calculated by getting the market addresses from comptroller and calling the getCash() on-chain method to get the amount of tokens locked in each of these addresses, then we get the price of each token from coingecko. To view the Borrowed amounts along with the currently liquidity, click the 'Borrowed' check box",
}