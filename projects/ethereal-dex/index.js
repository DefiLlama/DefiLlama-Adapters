const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  ethereal: {
    tvl: sumTokensExport({ owner: '0xB3cDC82035C495c484C9fF11eD5f3Ff6d342e3cc', token: ADDRESSES.ethereal.WUSDe})
  }
}