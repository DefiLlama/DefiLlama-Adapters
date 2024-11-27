const { iziswapExport } = require('../helper/iziswap')

const poolHelpers = {
  'neon_evm': ['0x33531bDBFE34fa6Fd5963D0423f7699775AacaaF'],
} // liquidityManager contracts

Object.keys(poolHelpers).forEach(chain => {
  module.exports[chain] = { tvl: iziswapExport({ poolHelpers: poolHelpers[chain] }), }
})