const ADDRESSES = require('../helper/coreAssets.json')
const { compoundExports, methodology, } = require("../helper/compound");
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

// node test.js projects/planet-green/index.js
module.exports = mergeExports([
{ bsc: {
  tvl: compoundTVL1.tvl
}, },
{ bsc: compoundTVL2, },
]);

module.exports.methodology = methodology;