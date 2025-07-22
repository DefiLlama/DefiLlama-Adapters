const sdk = require('@defillama/sdk');
const { sumTokensExport } = require('../helper/sumTokens');
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

module.exports = {
  methodology: "BTC on btc chain",
  bitcoin: {
    tvl: sdk.util.sumChainTvls([
      sumTokensExport({ owners: bitcoinAddressBook.binance2 }),
    ]),
  },
};