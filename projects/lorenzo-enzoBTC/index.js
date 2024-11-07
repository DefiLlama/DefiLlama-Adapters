const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')
const { sumTokensExport } = require("../helper/sumTokens");

module.exports = {
    methodology: "enzoBTC, Lorenzo Wrapped Bitcoin",
    bitcoin: { tvl: sumTokensExport({ owners: bitcoinAddressBook.lorenzo2 }) }
};