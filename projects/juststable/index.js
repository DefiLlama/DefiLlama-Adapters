const { sumTokensExport } = require('../helper/unwrapLPs');
const ADDRESSES = require('../helper/coreAssets.json');

module.exports = {
  timetravel: false,
  tron: {
    tvl: sumTokensExport({ owner: 'TRrY9fXGnfLmcp7ytkLmHiTpvYMHG6zUGF', tokens: [ADDRESSES.tron.WTRX] })
  },
  hallmarks: [
    [1733270400, "TRX token price was increasing over 90%"],
  ],
}
