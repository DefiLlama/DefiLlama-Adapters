const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  bouncebit: {
    tvl: sumTokensExport({ owner: '0xA19237FFc49D1b71f00DA1a82cfF79CE7789f74A', token: '0xF4c20e5004C6FDCDdA920bDD491ba8C98a9c5863'})
  }
}