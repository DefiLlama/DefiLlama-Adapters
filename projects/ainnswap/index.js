const { iziswapExport } = require('../helper/iziswap')

const poolHelpers = {
  'ailayer': ['0x19b683A2F45012318d9B2aE1280d68d3eC54D663'],
} // iziswap liquidityManager contracts


Object.keys(poolHelpers).forEach(chain => {
  module.exports[chain] = { tvl: iziswapExport({ poolHelpers: poolHelpers[chain], }), }
})