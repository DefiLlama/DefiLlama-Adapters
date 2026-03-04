const sdk = require('@defillama/sdk');
const { sumTokensExport } = require('../helper/sumTokens');
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

module.exports = {
  methodology: "LTC collateral backing CBLTC. https://www.coinbase.com/en-sg/cbltc/proof-of-reserves",
  litecoin: {
    tvl: sdk.util.sumChainTvls([
      sumTokensExport({ owners: bitcoinAddressBook.coinbaseltc }),
    ]),
  },
};
