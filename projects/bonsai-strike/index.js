const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  bsc: {
    tvl: sumTokensExport({ owners: ['0x01cEF5B79044E1CCd9b6Ad76c3d0985b5A33F769', '0x4b9d1cf13129a79d92bef13dac908e9ffc665ad8'], tokens: [ADDRESSES.bsc.WBNB]}),
  }
}; 