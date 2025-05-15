const { getUniTVL } = require("../helper/unknownTokens");

const config = {
  soneium: '0x48E07EE0E8450811AD472fFf10aB68B895EA747A',
  unichain: '0x242c913Ff5FE010430A709baab977e88435b7EBF',
  hemi: '0x242c913Ff5FE010430A709baab977e88435b7EBF'
}

module.exports = {
  misrepresentedTokens: true,
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl: getUniTVL({ factory: config[chain], useDefaultCoreAssets: true, }), }
})
