const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')
const { sumTokensExport } = require("../helper/sumTokens");

module.exports = {
    methodology: "bgBTC, BitGet Wrapped Bitcoin",
    bitcoin: { tvl: sumTokensExport({ owners: bitcoinAddressBook.bitgetBtc }) }
};