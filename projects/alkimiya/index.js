const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')


module.exports = {
  base: {
    tvl: sumTokensExport({ owner: '0xa979E1d73f233087d3808cFc02C119F5EA75DE36', tokens: [ADDRESSES.base.USDC, ADDRESSES.base.cbBTC, ADDRESSES.base.WETH] })
  }
}