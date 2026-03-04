const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')
const { sumTokensExport } = require("../helper/sumTokens");

module.exports = {
    methodology: "Echo is a Bitcoin liquidity aggregation and yield infrastructure layer",
    bitcoin: { tvl: sumTokensExport({ owners: bitcoinAddressBook.echoMBTC }) }
};