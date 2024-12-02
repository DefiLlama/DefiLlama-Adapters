const { sumTokensExport } = require("../helper/sumTokens");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

module.exports = {
    doublecounted: true,
    bitcoin: { tvl: sumTokensExport({ owners: bitcoinAddressBook.chakra }) },
};
