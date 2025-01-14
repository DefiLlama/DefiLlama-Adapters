const { sumTokensExport } = require("../helper/unwrapLPs")
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  methodology: 'Counts the number of tokens in the Windfall contract.',
}; 

const config = {
  canto: { tokens: ['0xEe602429Ef7eCe0a13e4FfE8dBC16e101049504C'], owners: ['0x2d9dDE57Ec40baF970Dbc8f7933861013B661c93'] },
  blast: { tokens: [ADDRESSES.blast.USDB, ADDRESSES.blast.WETH], owners: ['0x0a4C236254C4C0bD5DD710f1fa12D7791d491358', '0x6d89540c22868ff9e3676423162a9e909BBB2558',] },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport(config[chain])
  }
})