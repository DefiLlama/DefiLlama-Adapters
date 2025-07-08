const { sumTokensExport } = require("../helper/sumTokens");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

module.exports = {
  methodology: "TVL counts tokens deposited in BEVM",
  //doublecounted: true,
  bitcoin: {
    tvl: sumTokensExport({ owners: bitcoinAddressBook.bevm }),
  },
};
