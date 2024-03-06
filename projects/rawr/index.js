const { iziswapExport } = require("../helper/iziswap")

const poolHelpers = {
  'blast': ['0x5e7902aDf0Ea0ff827683Cc1d431F740CAD0731b'],
} //liquidityManager contracts

Object.keys(poolHelpers).forEach(chain => {
  module.exports[chain] = { tvl: iziswapExport  ({ poolHelpers: poolHelpers[chain], }), }
})