const { sumERC4626VaultsExport } = require('../helper/erc4626')

module.exports = {
  methodology: 'Delta neutral farming in GMX Vault',
  start: 1716638498,
  doublecounted: true,
  arbitrum: {
    tvl: sumERC4626VaultsExport({ vaults: ['0xd8dd54df1a7d2ea022b983756d8a481eea2a382a',], isOG4626: true, }),
  },
}