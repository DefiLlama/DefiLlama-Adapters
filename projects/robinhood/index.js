const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
        "0x6081258689a75d253d87cE902A8de3887239Fe80",
        "0x40b38765696e3d5d8d9d834d8aad4bb6e418e489",
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.robinhood,
  },
  polygon: {
    owners: [
        "0x6081258689a75d253d87cE902A8de3887239Fe80",
    ],
  },
  avax: {
    owners: [
        "0x6081258689a75d253d87cE902A8de3887239Fe80",
        "0x40b38765696e3d5d8d9d834d8aad4bb6e418e489",
    ],
  },
}

module.exports = cexExports(config)
