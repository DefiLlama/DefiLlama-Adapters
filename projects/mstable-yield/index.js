const { sumERC4626VaultsExport } = require('../helper/erc4626')

const vaults = [
  '0x9614a4C61E45575b56c7e0251f63DCDe797d93C5', // 3CRV
]

module.exports = {
  deadFrom: '2023-04-07',
  ethereum: {
    tvl: sumERC4626VaultsExport({ vaults, isOG4626: true })
  }
}
