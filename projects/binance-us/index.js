const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
      '0x61189da79177950a7272c88c6058b96d4bcd6be2',
      '0x34ea4138580435b5a521e460035edb19df1938c1',
      '0xf60c2ea62edbfe808163751dd0d8693dcb30019c',
    ],
  },
}

module.exports = cexExports(config)
module.exports.methodology = 'This wallets where collect from etherscan labelling.'