


const { getUniTVL } = require("../helper/unknownTokens");

const config = {
  xlayer: '0xa7afb6163c331ddb0845843889d6f9544328846f',
  zkfair: '0x174c4C03DfeA09682728A5959A253bf1F7C7766F',
  zeta: '0x174c4C03DfeA09682728A5959A253bf1F7C7766F',
  blast: '0xA7afB6163c331DDb0845843889D6f9544328846F',
  cyeth: '0x174c4c03dfea09682728a5959a253bf1f7c7766f',
  cronos_zkevm: '0x76D1fC018676f8A973474C24F40A2e14e401b770',
  morph: '0x174c4C03DfeA09682728A5959A253bf1F7C7766F',
}

module.exports = {
  misrepresentedTokens: true,
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl: getUniTVL({ factory: config[chain], useDefaultCoreAssets: true, }), }
})

