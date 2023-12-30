const { getUniTVL } = require('../helper/unknownTokens')

const config = {
  ethereum: { factory: '0x3823Ac41b77e51bf0E6536CE465479cBdedcaEa9', },
  bsc: { factory: '0xFC2604a3BCB3BA6016003806A288E7aBF75c8Aa3', },
  polygon: { factory: '0x25cc30af6b2957b0ed7ceca026fc204fdbe04e59', },
  velas: { factory: '0xFC2604a3BCB3BA6016003806A288E7aBF75c8Aa3', },
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "TVL is calculated from the Bamboo DeFi factory smart contracts on each chain.",
};

Object.keys(config).forEach(chain => {
  const { factory } = config[chain]
  module.exports[chain] = {
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true, })
  }
})
