const { sumTokensExport } = require('../helper/sumTokens');
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

//https://docs.hyperunit.xyz/developers/key-addresses

module.exports = {
  methodology: 'BTC wallets on bc1pdwu79dady576y3fupmm82m3g7p2p9f6hgyeqy0tdg7ztxg7xrayqlkl8j9',
  bitcoin: {
    tvl: sumTokensExport({ owners: bitcoinAddressBook.unitbtc }),
  },
};