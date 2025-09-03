const { sumTokensExport } = require("../helper/sumTokens");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");

module.exports = {
  methodology: "Lorenzo, As the Bitcoin Liquidity Finance Layer",
  doublecounted: true,
  bitcoin: { tvl: sumTokensExport({ owners: bitcoinAddressBook.lorenzo }) }
};
