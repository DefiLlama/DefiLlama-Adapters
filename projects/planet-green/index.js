const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { compoundExports } = require("../helper/compound");
const { staking } = require("../helper/staking.js");
const { mergeExports } = require("../helper/utils");



const compoundTVL1 = compoundExports(
  '0xF54f9e7070A1584532572A6F640F09c606bb9A83',
  'bsc',
  '0x24664791B015659fcb71aB2c9C0d56996462082F',
  ADDRESSES.bsc.WBNB
)

const compoundTVL2 = compoundExports(
  '0x1e0C9D09F9995B95Ec4175aaA18b49f49f6165A3',
  'bsc',
  '0x190354707Ad8221bE30bF5f097fa51C9b1EbdB29',
  ADDRESSES.bsc.WBNB
)

// node test.js projects/green-planet/index.js
module.exports = mergeExports([
{methodology: "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending.. TVL is calculated by getting the market addresses from comptroller and calling the getCash() on-chain method to get the amount of tokens locked in each of these addresses, then we get the price of each token from coingecko."},
{ bsc: {
  tvl: compoundTVL1.tvl
}, },
{ bsc: compoundTVL2, },
]);