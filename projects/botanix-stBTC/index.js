const { sumERC4626VaultsExport2 } = require('../helper/erc4626')

module.exports = {
  btnx: {
    tvl: sumERC4626VaultsExport2({ vaults: ['0xF4586028FFdA7Eca636864F80f8a3f2589E33795'], }),
  },
}
