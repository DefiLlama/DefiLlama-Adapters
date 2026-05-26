const { sumTokens2 } = require('../helper/unwrapLPs')

const PAIR_IUSD_WINRI = '0xcaFFACD05499d005d8441337811bAd227Fa24643'

const IUSD = '0x116b2fF23e062A52E2c0ea12dF7e2638b62Fa0FC'
const WINRI = '0x8731F1709745173470821eAeEd9BC600EEC9A3D1'

async function tvl(api) {
  return sumTokens2({
    api,
    owner: PAIR_IUSD_WINRI,
    tokens: [IUSD, WINRI],
  })
}

module.exports = {
  methodology:
    'TVL counts the iUSD and WINRI reserves held in the official INRISwap iUSD/WINRI liquidity pair on INRI CHAIN. Initial liquidity is small and should not be used as an official INRI price source.',
  inri: {
    tvl,
  },
}
