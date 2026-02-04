const { cexExports } = require('../helper/cex');
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js');

const config = {
  bitcoin: {
    owners: bitcoinAddressBook.bitomato,
  },
  ethereum: {
    owners: [
      '0x0b8b4EB21787d5a07AbAF6BC35E15CD5C59Cbb94', // Ethereum address for Bitomato
    ],
  },
  bsc: {
    owners: [
      '0x0b8b4EB21787d5a07AbAF6BC35E15CD5C59Cbb94', // BSC address for Bitomato
    ],
  },
};

module.exports = cexExports(config);
module.exports.methodology = 'We are tracking part of their cold wallets for Bitomato. The addresses were provided based on public information and verified activity.';
