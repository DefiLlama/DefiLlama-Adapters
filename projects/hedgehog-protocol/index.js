const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const HEDGEHOG_CORE = '0x985A53B9b82eF766E69FD7DA49E4D53e1A13a27e'
const HEDGE_TOKEN = '0x5cccEbCb0C0af721a6539aFDa1628EeaAF7d6C5c'

module.exports = {
  methodology: 'TVL is the native S and USDC held in the HedgehogCore contract — including hub pool liquidity and bonding curve spoke reserves.',
  sonic: {
    tvl: sumTokensExport({
      owners: [HEDGEHOG_CORE],
      tokens: [ADDRESSES.null, ADDRESSES.sonic.USDC_e],
    }),
  },
}
