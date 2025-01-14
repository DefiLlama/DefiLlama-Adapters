const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')


module.exports = {
  polynomial: {
    tvl: sumTokensExport({ owner: '0xc133983D6d9140923b5eaE52664221d9099cf119', tokens: [ADDRESSES.polynomial.fxUSDC,ADDRESSES.polynomial.SDAI, ADDRESSES.polynomial.sUSDe, ADDRESSES.polynomial.USD0]})
  }
}