const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  bitcoin: { owners: bitcoinAddressBook.exmo },
  ethereum: {
    owners: [
      '0x112A52893b96E9679E854934A62841051a679dAA',
      '0x6297C8ec7662c10CdACFb3e9C04B571528d277E2',
    ],
  },
  ethereumclassic: {
    owners: [
      '0xD936704458E4f8525B6bE7C0ebC5fE268BaB4977',
    ]
  },
  tron: {
    owners: [
      'TMjqArFD86YDNShnMXSzYqDXKZAphGSJN7',
    ]
  },
  ton: {
    owners: [
      'UQAAdyo7XAGGaNbg7BbHq3XhPXhuFJuX64KStIgOyiFWZiuP',
    ]
  },
}

module.exports = cexExports(config)
