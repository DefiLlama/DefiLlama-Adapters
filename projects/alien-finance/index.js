const { sumTokensExport } = require("../helper/unwrapLPs")
const ADDRESSES = require('../helper/coreAssets.json')

const owner = "0x50454acC07bf8fC78100619a1b68e9E8d28cE022"

module.exports = {
  blast: {
    tvl: sumTokensExport({ owner, tokens: [ADDRESSES.blast.USDB, ADDRESSES.blast.WETH]}),
  },
  start: 1709630412,
};
