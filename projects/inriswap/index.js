const { sumTokens2 } = require('../helper/unwrapLPs')
const { nullAddress } = require('../helper/tokenMapping')

const PAIR_IUSD_WINRI = '0xcaFFACD05499d005d8441337811bAd227Fa24643'
const LIQUIDITY_SEEDER = '0x34583A7080d47Af38d76Bae78c51Ecd0C64442cF'

const IUSD = '0x116b2fF23e062A52E2c0ea12dF7e2638b62Fa0FC'
const WINRI = '0x8731F1709745173470821eAeEd9BC600EEC9A3D1'

async function tvl(api) {
  return sumTokens2({
    api,
    tokensAndOwners: [
      [IUSD, PAIR_IUSD_WINRI],
      [WINRI, PAIR_IUSD_WINRI],
      [IUSD, LIQUIDITY_SEEDER],
      [nullAddress, LIQUIDITY_SEEDER],
    ],
  })
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    'TVL counts assets held in the official INRISwap iUSD/WINRI pair and the official Liquidity Seeder contract used during the liquidity formation phase. The Seeder holds iUSD and native INRI outside the live pair until the liquidity target is reached.',
  inri: {
    tvl,
  },
}
