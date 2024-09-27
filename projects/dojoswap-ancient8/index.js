const { getUniTVL } = require('../helper/unknownTokens')

const config = {
  ancient8: { factory: '0x7d6eb409e2540d27Ea6Dc976E1a549a3dBcBfFBC', key: 'A8ChainMainnet' },
}

Object.keys(config).forEach(chain => {
  const { factory, key } = config[chain]
  module.exports[chain] = {
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true, chain, fetchBalances: true })
  }
})

module.exports.misrepresentedTokens = true