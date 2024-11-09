const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  reya: { tvl: sumTokensExport({ owner: '0xA763B6a5E09378434406C003daE6487FbbDc1a80', tokens: [ADDRESSES.reya.RUSD]})}
}