const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  bitcoin: {
    owners: [
      '39BFtTzZjj6o2s7eewefFQxqM4617VmhEK'
    ]
  },
  ethereum: {
    owners: [
      '0xcfed1443a1ed773119ed1a41a39b3b66f0ffde0f',
      '0x302f4d246fc1E283AF3239311B8B84bD5a1c7736',
      '0x03feA254cfA7434004E8d495725bCbB7cCc40454',
      '0x7a2556e23ce7bc1ADFBDCa650130390A10C05f63'
    ],
  },
  bsc: {
    owners: [
      '0x83455d6c365dcbac10855c623da884b552aaefdd',
      'bnb1v8vkkymvhe2sf7gd2092ujc6hweta38xadu2pj',
      '0x03feA254cfA7434004E8d495725bCbB7cCc40454'
    ]
  },
  polygon: {
    owners: [
      '0x302f4d246fc1E283AF3239311B8B84bD5a1c7736'
    ]
  }
}

module.exports = cexExports(config)
module.exports.methodology = 'We are only tracking part of their cold wallets for P2PB2B, more information here https://coinmarketcap.com/exchanges/p2b/'
