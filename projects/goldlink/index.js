const { sumERC4626VaultsExport } = require('../helper/erc4626')

module.exports = {
  methodology: 'Delta neutral farming in GMX Vault',
  start: '2024-05-25',
  doublecounted: true,
  arbitrum: {
    tvl: sumERC4626VaultsExport({ vaults: ['0xd8dd54df1a7d2ea022b983756d8a481eea2a382a',], isOG4626: true, }),
  },
  avax: {
    tvl: sumERC4626VaultsExport({ vaults: ['0xbE6eB54D1e96CC59338BE9A281d840AcE82df095',], isOG4626: true, }),
  }
}