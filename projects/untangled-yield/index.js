const { sumERC4626VaultsExport } = require('../helper/erc4626')

module.exports = {
  celo: {
    tvl: sumERC4626VaultsExport({ vaults: ['0x2a68c98bd43aa24331396f29166aef2bfd51343f'], isOG4626: true, })
  }
}