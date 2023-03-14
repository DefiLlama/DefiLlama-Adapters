const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  polygon: {
    tvl: sumTokensExport({ owner: '0x6fd5b386d8bed29b3b62c0856250cdd849b3564d', tokens: ['0x2791bca1f2de4661ed88a30c99a7a9449aa84174']})
  }
}