const { getUniTVL } = require('../helper/unknownTokens')

const config = {
  arbitrum: '0x61f4ECD130291e5D5D7809A112f9F9081b8Ed3A5',
  ethereum: '0xE48AEE124F9933661d4DD3Eb265fA9e153e32CBe',
  polygon_zkevm: '0x8aF94528FBE3c4C148523E7aAD48BcEbcC0A71d7',
}

module.exports = {
  misrepresentedTokens: true,
};

Object.keys(config).forEach(chain => {
  const factory = config[chain]
  module.exports[chain] = {
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true, fetchBalances: true, })
  }
})
