const ADDRESSES = require('../helper/coreAssets.json')
const {  aaveV2Export,  } = require('../helper/aave');
const {  mergeExports,  } = require('../helper/utils');

module.exports = mergeExports([
  {
    ethereum: aaveV2Export('0x9f72DC67ceC672bB99e3d02CbEA0a21536a2b657', { useOracle: true }),
  },
  {
    misrepresentedTokens: true,
    hallmarks: [
      [Math.floor(new Date('2023-06-11')/1e3), 'Protocol was hacked'],
    ],
    ethereum: aaveV2Export('0xA422CA380bd70EeF876292839222159E41AAEe17', { useOracle: true }),
    fantom: aaveV2Export('0x7ff2520cd7b76e8c49b5db51505b842d665f3e9a', { useOracle: true, baseCurrency: ADDRESSES.fantom.DAI }),
    methodology: "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending.. TVL is calculated by getting the market addresses from comptroller and calling the getCash() on-chain method to get the amount of tokens locked in each of these addresses, then we get the price of each token from coingecko. To view the Borrowed amounts along with the currently liquidity, click the 'Borrowed' check box",
  }
])

module.exports.doublecounted = true
