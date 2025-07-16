const { sumERC4626VaultsExport } = require('../helper/erc4626')

module.exports = {
  celo: {
    tvl: sumERC4626VaultsExport({ vaults: ['0x2a68c98bd43aa24331396f29166aef2bfd51343f'], isOG4626: true, })
  },
  polygon: {
    tvl: sumERC4626VaultsExport({ vaults: ['0x3f48e00CFEba3e713dB8Bc3E28d634578c553e32'], isOG4626: true, })
  }
}