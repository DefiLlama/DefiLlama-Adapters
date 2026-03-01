const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  flare: {
    tvl: sumTokensExport({
      owners: [
        '0x194726F6C2aE988f1Ab5e1C943c17e591a6f6059', // FB Main (BANK token backing)
        '0x90679234FE693B39BFdf5642060Cb10571Adc59b'  // IBDP
      ],
      token: ADDRESSES.flare.WFLR
    })
  }
}
