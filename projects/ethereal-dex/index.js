const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  ethereal: {
    tvl: sumTokensExport({ owner: '0xB3cDC82035C495c484C9fF11eD5f3Ff6d342e3cc', token: '0xB6fC4B1BFF391e5F6b4a3D2C7Bda1FeE3524692D'})
  }
}