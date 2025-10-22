const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const config = {
  abstract: { owner: '0x3e0F5F8F5Fb043aBFA475C0308417Bf72c463289', tokens: [ADDRESSES.abstract.USDC] },
  linea: { owner: '0x39e66ee6b2ddaf4defded3038e0162180dbef340', tokens: [ADDRESSES.linea.USDC] },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport(config[chain])
  }
})