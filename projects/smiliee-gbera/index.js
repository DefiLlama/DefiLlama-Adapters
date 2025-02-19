const { sumERC4626VaultsExport } = require('../helper/erc4626')

module.exports = {
  berachain: { tvl: sumERC4626VaultsExport({ vaults: ['0x3f7755117f1fec1981aefb01887240dbf5f2ebce'], tokenAbi: 'wbera', balanceAbi: 'totalAssets' }) },
}