const { getUniTVL } = require('../helper/unknownTokens')

const chain = 'dogechain'
const DMUSK = '0xdD1D3B04939972A617E0bA7710591B03E825207c'
const lps = ['0x4Ef34A9C9906d67c2F28ba3EEe2d01B1Fb7b6e81']


module.exports = {
  misrepresentedTokens: true,
  dogechain: {
    tvl: getUniTVL({
      factory: '0x4e5E0739231A3BdE1c51188aCfEabC19983541E6',
      useDefaultCoreAssets: true,
    })
  }
}
