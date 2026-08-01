const { sumERC4626VaultsExport } = require('../helper/erc4626')

module.exports = {
  ethereum: {
    tvl: sumERC4626VaultsExport({ vaults: ['0x3742f3Fcc56B2d46c7B8CA77c23be60Cd43Ca80a'], tokenAbi: 'avail', balanceAbi: 'assets'}),
  }
}