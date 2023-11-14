const { getUniTVL } = require('../helper/unknownTokens')
const config = {
  ethereum: '0xcBAE5C3f8259181EB7E2309BC4c72fDF02dD56D8',
  pulse: '0x5b9f077a77db37f3be0a5b5d31baeff4bc5c0bd7',
}

module.exports = {
  misrepresentedTokens: true
}

Object.keys(config).forEach(chain => {
  const factory = config[chain]
  module.exports[chain] = {
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true, fetchBalances: true })
  }
})