const { sumTokensExport } = require('../helper/sumTokens');
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

module.exports = {
  timetravel: false,
  bitcoin: {
    tvl: sumTokensExport({ owners: bitcoinAddressBook.hemiBTC }),
  },
};