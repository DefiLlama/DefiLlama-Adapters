const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        '0xCAF80cfacBEF94d37De091093822f2a862adc47F'
    ],
  },
  bitcoin: {
    owners: [
        '3926KKKCqcLaWpAau73TMo19sNv23s1wji'
    ]
  },
  bsc: {
    owners: [
        '0xCAF80cfacBEF94d37De091093822f2a862adc47F'
    ]
  },
}

module.exports = cexExports(config)