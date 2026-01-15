const { sumTokensExport } = require('../helper/sumTokens');
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

//https://tzbtc.io/transparency/

module.exports = {
  methodology: 'BTC wallets on bc1q2f0tczgrukdxjrhhadpft2fehzpcrwrz549u90',
  bitcoin: {
    tvl: sumTokensExport({ owners: bitcoinAddressBook.tzbtc }),
  },
};