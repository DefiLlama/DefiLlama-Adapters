const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const config = {
  abstract: { owner: '0x5E3EbEc100e2294C0EB2264FC96225dF067AAaa3', tokens: [ADDRESSES.abstract.USDC] },
  linea: { owner: '0x5E3EbEc100e2294C0EB2264FC96225dF067AAaa3', tokens: [ADDRESSES.linea.USDC] },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport(config[chain])
  }
})