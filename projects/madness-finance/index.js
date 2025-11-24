const { getUniTVL } = require("../helper/unknownTokens");

const config = {
  monad: '0x93d71152A93619c0b10A2EFc856AC46120FD01Ab',
}

module.exports = {
  misrepresentedTokens: true,
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl: getUniTVL({ factory: config[chain], useDefaultCoreAssets: true, }), }
})

