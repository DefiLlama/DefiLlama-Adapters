const { getUniTVL } = require('../helper/unknownTokens')

const config = {
  onus: '0xf57578DD26422e80ab4051165Fb64DA1F25E740A',
}

module.exports = {
  misrepresentedTokens: true,
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: config[chain], })
  }
})
