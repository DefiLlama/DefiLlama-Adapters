const { sumTokensExport,  } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  hyperliquid: {
    tvl: sumTokensExport({ owner: '0x9246d27EA8059529a615a4ACF35351dF0fa6168e', tokens: [ADDRESSES.hyperliquid.WHYPE] }),
  },
}
