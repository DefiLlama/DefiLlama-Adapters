const { sumTokensExport } = require('../helper/unwrapLPs');
const ADDRESSES = require('../helper/coreAssets.json');

module.exports = {
  timetravel: false,
  tron: {
    tvl: sumTokensExport({ owner: 'TRrY9fXGnfLmcp7ytkLmHiTpvYMHG6zUGF', tokens: [ADDRESSES.tron.WTRX] })
  },
  hallmarks: [
    ['2024-12-04', "TRX token price was increasing over 90%"],
  ],
}
