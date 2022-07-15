const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')
const FACTORY = '0x7D2Ce25C28334E40f37b2A068ec8d5a59F11Ea54'
const pinksToken = '0x702b3f41772e321aacCdea91e1FCEF682D21125D'
const masterChef = '0xe981676633dCf0256Aa512f4923A7e8DA180C595'

module.exports = {
  bsc: {
    tvl: getUniTVL({
      chain: 'bsc',
      factory: FACTORY,
      coreAssets: [
        '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
        '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d', // BUSD
        '0x55d398326f99059ff775485246999027b3197955', // USDT
        pinksToken,
      ]
    }),
    staking: staking(masterChef, pinksToken, 'bsc'),
  }
}