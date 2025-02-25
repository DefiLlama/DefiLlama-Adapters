const { sumTokensExport } = require("../helper/sumTokens");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

module.exports = {
  timetravel: false,
  methodology: `Tokens bridged via ROUP are counted as TVL`,
  bitcoin: {
    tvl: sumTokensExport({
      owners: bitcoinAddressBook.roup,
      includeBRC20: true,
      blacklistedTokens: ['roup'],
    }),
  }
}

