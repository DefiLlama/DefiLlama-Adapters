const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const ARROWPAD = '0x5d2391cf88cd48bb6b9ec12b38bc8119562f9012'

module.exports = {
  methodology: 'ETH held in the ArrowPad bonding-curve contract: funds raised by launched tokens that have not yet graduated to Uniswap.',
  start: '2026-07-03',
  robinhood: {
    tvl: sumTokensExport({ owner: ARROWPAD, tokens: [ADDRESSES.null, ADDRESSES.robinhood.WETH] }),
  },
}
