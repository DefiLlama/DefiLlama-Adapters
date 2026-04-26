const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({
      owner: '0x9AdCbEd09f911060Ef36570dC411196A86Ffb644',
      tokens: [ADDRESSES.arbitrum.USDC_CIRCLE],
    })
  },
}