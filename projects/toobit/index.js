const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
        '0xCAF80cfacBEF94d37De091093822f2a862adc47F',
        '0x3244609ee06ae8f403003c624314e50e6c2ac01a',
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.toobit
  },
  bsc: {
    owners: [
        '0xCAF80cfacBEF94d37De091093822f2a862adc47F'
    ]
  },
}

module.exports = cexExports(config)