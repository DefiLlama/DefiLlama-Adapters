
const { getUniTVL } = require("../helper/unknownTokens");

const config = {
  xlayer: '0xa7afb6163c331ddb0845843889d6f9544328846f',
  zkfair: '0x174c4C03DfeA09682728A5959A253bf1F7C7766F',
  zeta: '0x174c4C03DfeA09682728A5959A253bf1F7C7766F',
  blast: '0xA7afB6163c331DDb0845843889D6f9544328846F',
}

module.exports = {
  misrepresentedTokens: true,
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl: getUniTVL({ factory: config[chain], useDefaultCoreAssets: true, }), }
})