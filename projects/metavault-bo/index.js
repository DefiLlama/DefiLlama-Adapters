const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  polygon: {
    tvl: sumTokensExport({ owner: '0x6fd5b386d8bed29b3b62c0856250cdd849b3564d', tokens: [ADDRESSES.polygon.USDC]})
  }
}