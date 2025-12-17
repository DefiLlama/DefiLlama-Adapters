const ADDRESSES = require('../helper/coreAssets.json')
const { compoundExports } = require('../helper/compound');

// BSC
const unitroller = "0xA6bEd5B7320941eA185A315D1292492F7Fdd1e5c";
const kBnb = "0x2C334c6cBC0547e759084bD8D469f933B17Ff481";
const wbnb = ADDRESSES.bsc.WBNB
// OKEX
const okexUnitroller = "0x9589c9c9b7A484F57d69aC09c14EcE4b6d785710";
const kOkt = "0x4923abEe988f7bB7A9ae136BEBE4A8455e8dE229";
const wokt = ADDRESSES.okexchain.WOKT

module.exports = {
  bsc: {
    ...compoundExports(unitroller, kBnb, wbnb),
    pool2: () => ({})
  },
  okexchain: {
    ...compoundExports(okexUnitroller, kOkt, wokt),
    pool2: () => ({})
  }
}
module.exports.bsc.borrowed = ()  => ({})
module.exports.okexchain.borrowed = ()  => ({})
module.exports.deadFrom = '2025-05-01' 