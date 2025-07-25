const sdk = require('@defillama/sdk');
const { sumTokensExport } = require('../helper/sumTokens');
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

module.exports = {
  methodology: "BTC collateral backing CBBTC. https://www.coinbase.com/cbbtc/proof-of-reserves",
  bitcoin: {
    tvl: sdk.util.sumChainTvls([
      sumTokensExport({ owners: bitcoinAddressBook.coinbasebtc }),
    ]),
  },
};
