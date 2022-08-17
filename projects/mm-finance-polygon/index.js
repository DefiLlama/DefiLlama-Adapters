const { staking, } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens')

const factory = '0x7cFB780010e9C861e03bCbC7AC12E013137D47A5'
const mmfToken = '0x22a31bD4cB694433B6de19e0aCC2899E553e9481'
const masterChef = '0xa2B417088D63400d211A4D5EB3C4C5363f834764'

module.exports = {
  timetravel: true,
  methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://polymm.finance as the source. Staking accounts for the MMF locked in MasterChef (0xa2B417088D63400d211A4D5EB3C4C5363f834764)',
  polygon: {
    staking: staking(masterChef, mmfToken, 'polygon'),
    tvl: getUniTVL({ 
      chain: 'polygon',
      factory,
      coreAssets: [
        '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', // WMATIC
        '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // USDC
        '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // USDT
        '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063', // DAI
      ],
    }),
  },
}