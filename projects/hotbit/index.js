const { cexExports } = require('../helper/cex')

const config = {
  bsc: {
    owners: [
        '0xC7029E939075F48fa2D5953381660c7d01570171'
    ],
  },
  ethereum: {
    owners: ['0x562680a4dc50ed2f14d75bf31f494cfe0b8d10a1']
  },
  tron: {
    owners: ['TS9b9boewmB6tq874PnVZrKPf4NZw9qHPi']
  }
}

module.exports = cexExports(config)
module.exports.methodology = 'We have collect this wallets from Hotbit Team on the 14/12/22'