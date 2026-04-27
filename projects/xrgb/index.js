const { sumTokensExport } = require("../helper/chain/brc20");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

module.exports = {
  methodology: "XRGB as bridge,Unlock ERC404 on all chains",
  deadFrom: '2024-06-10',
  bitcoin: {  tvl: sumTokensExport({ owners: bitcoinAddressBook.xrgb, blacklistedTokens: ['XRGB'] }) }
};