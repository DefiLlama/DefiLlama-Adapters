const { iziswapExport } = require('../helper/iziswap')

module.exports = {
  aurora: {
    tvl: iziswapExport({poolHelpers: ['0xE78e7447223aaED59301b44513D1d3A892ECF212']})
  }
}
