const { sumTokensExport } = require("../helper/sumTokens");
const sdk = require("@defillama/sdk");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

module.exports = {
  methodology: `Total amount of BTC in ${ bitcoinAddressBook.pstakeBTC.join(", ")}. Restaked on babylon`,
  doublecounted:true,
  bitcoin: { tvl: sdk.util.sumChainTvls([sumTokensExport({ owners: bitcoinAddressBook.pstakeBTC })]) },
};
