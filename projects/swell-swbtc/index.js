const { sumERC4626VaultsExport } = require('../helper/erc4626')

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: sumERC4626VaultsExport({ vaults: ['0x8DB2350D78aBc13f5673A411D4700BCF87864dDE'], isOG4626: true, }),
  },
}