const { sumTokensExport } = require("../helper/sumTokens.js");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");

module.exports = {
  bitcoin: { tvl: sumTokensExport({ owners: bitcoinAddressBook.circleBTC }) }
}