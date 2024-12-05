const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
        "0x5569fd6991d1802dbee9bdd67e763fe7be67c7a9",
        "0xcBEA7739929cc6A2B4e46A1F6D26841D8d668b9E"
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.hashkey,
  },
  litecoin: {
    owners: [
        "ltc1qzjsgswkenmy9v6vm2jvkddeczwfuy9q7rshtxh",
        "LXeSRVh6WPan3u5AxEZkvvn1srKnN5BiAm"
    ],
  },
  optimism: {
    owners: [
        "0x5691a157ce38f1b362ab4a686ec7616fb04ba6f1",
        "0xC7556Bb9EB188888b1cce25c3587C36Be0809EC4"
    ],
  },
  arbitrum: {
    owners: [
        "0x03248f4759Ef5c4FdDd959aa07a5294e00B03e44",
        "0x25a58cee7928b3d6c1d392ebe1a97318aa5ff2f2"
    ],
  },
  avax: {
    owners: [
        "0x9bc72c8bb18d27bad9d0936be5d5e68fe2d37a29",
    ],
  },
  polygon: {
    owners: [
        "0xAa0400E5a90f697230638DbE76D9C49e4aC745B4",
    ],
  },
}

module.exports = cexExports(config)
