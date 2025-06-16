const { sumTokensExport } = require('../helper/unwrapLPs')

const addresses = [
  '0x8283E74dA050F6eE93991Dfb0D823e35515Da8E8',
  '0x0A80980b0518FCEc884CEDED7C2A422CF7BCAb71',
  '0xf108E3A7aD6E51C067228D4BacD2677B67bb43A3',
  '0x3117E213a8AC1C49eCd18e74C65ee894cdcDEc5a',
  '0x15126c1A4413F464801D5D2fD1310E3cdeCc2918',
  '0x3A31d0ABA8d83720AF41AC3048186a41C1f60Cce',
]

module.exports = {
  base: {
    tvl: sumTokensExport({
      owners: addresses,
      fetchCoValentTokens: true
    })
  }
}
