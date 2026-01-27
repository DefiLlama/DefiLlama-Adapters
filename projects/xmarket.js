const ADDRESSES = require('./helper/coreAssets.json')
const { sumTokensExport } = require('./helper/unwrapLPs');

module.exports = {
  bsc: {
    tvl: sumTokensExport({ owners: ['0x7e1f4Ed04910Ed9C19e71e36D757F718A07ea9cA'], tokens: [ADDRESSES.bsc.USDT]})
  },
}
