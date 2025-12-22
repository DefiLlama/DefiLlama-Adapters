const { gmxExports } = require('../helper/gmx')

module.exports = {
  core: {
    tvl: gmxExports({ vault: '0x66249e4477940D40A3CE92552401A9Cc61a14474', fromBlock: 25450000, }),
  },
}
