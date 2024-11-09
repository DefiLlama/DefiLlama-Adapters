const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  scroll: {
    tvl: sumTokensExport({ owners: ['0xA79E00e68549e91e5f0c27048F453b3D87ef6E3D', '0x7Aa73970Dc1eAe1e39AA3eAC9F3DadB4468993a1'], tokens: [ADDRESSES.scroll.USDC] }),
  }
}
