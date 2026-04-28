const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  bsc: {
    tvl: sumTokensExport({ owners: ['0x6Dabbc1Fe8d1AF341B3DC328Ee77db20e05411DD'], tokens: [ADDRESSES.bsc.USDT]})
  },
}
