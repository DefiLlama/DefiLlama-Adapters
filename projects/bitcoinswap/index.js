const ADDRESSES = require('../helper/coreAssets.json')
const { iziswapExport } = require('../helper/iziswap')

const nullAddress = ADDRESSES.null
const poolHelpers = {
  'ethereum': '0x2BDE204066a8994357Fe84BFa2a92DA013bfAbdb',
} 

Object.keys(poolHelpers).forEach(chain => {
  module.exports[chain] = { tvl: iziswapExport({ poolHelpers: [poolHelpers[chain]], }) }
})