const { sumTokensExport } = require('../helper/unwrapLPs')

const TOKENS = [
  '0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd',
  '0x0CE35b0D42608Ca54Eb7bcc8044f7087C18E7717',
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
