const { sumTokensExport } = require("../helper/sumTokens");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

module.exports = {
  methodology: "Staking tokens via Babylon counts as TVL",
  doublecounted:true,
  bitcoin: { tvl: sumTokensExport({ owners: bitcoinAddressBook.xlinkLST }) }
}