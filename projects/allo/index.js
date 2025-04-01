const { sumTokensExport } = require("../helper/sumTokens");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')


module.exports = {
  methodology: `Total amount of BTC in restaked on babylon`,
  doublecounted:true,
  bitcoin: {
    tvl: sumTokensExport({ owners: bitcoinAddressBook.allo }),
  },
};
