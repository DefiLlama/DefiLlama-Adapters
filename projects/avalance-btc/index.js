const { sumTokensExport } = require('../helper/sumTokens');
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

//https://support.avax.network/en/articles/6349640-how-does-the-avalanche-bridge-work

module.exports = {
  methodology: 'BTC wallets on bc1q2f0tczgrukdxjrhhadpft2fehzpcrwrz549u90',
  bitcoin: {
    tvl: sumTokensExport({ owners: bitcoinAddressBook.avalanche }),
  },
};
