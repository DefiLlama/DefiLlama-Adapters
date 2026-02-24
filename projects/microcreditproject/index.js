const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const TOKENS = [
  ADDRESSES.functionx.WFX,
  ADDRESSES.islm.USDC,
]

const INVESTMENT_CONTRACT = '0x951d1571C75C519Cc3D09b6B71595C6aCe1c06dB'
const PROFIT_SHARE_CONTRACT = '0x165D74d2DEFe37794371eB63c63999ab5620DBfB'

module.exports = {
  islm: {
    tvl: sumTokensExport({
      owners: [INVESTMENT_CONTRACT, PROFIT_SHARE_CONTRACT],
      tokens: TOKENS
    }),
  },
}
