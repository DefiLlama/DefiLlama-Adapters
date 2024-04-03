const { gmxExports } = require('../helper/gmx')

module.exports = {
  arbitrum: {
    tvl: gmxExports({ vault: '0xec45801399EB38B75A3bf793051b00bb64fF3eF8', })
  },
}