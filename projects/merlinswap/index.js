const { iziswapExport } = require('../helper/iziswap')

const poolHelpers = {
  'merlin': ['0x261507940678Bf22d8ee96c31dF4a642294c0467'],
} // iziswap liquidityManager contracts


Object.keys(poolHelpers).forEach(chain => {
  module.exports[chain] = { tvl: iziswapExport({ poolHelpers: poolHelpers[chain], }), }
})