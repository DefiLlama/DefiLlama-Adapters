const { getUniTVL, } = require('../helper/unknownTokens');
const { staking } = require('../helper/staking')

module.exports = {
  ethereum: {
    tvl: getUniTVL({ factory: '0x7753F36E711B66a0350a753aba9F5651BAE76A1D',  fetchBalances: true, }),
    staking: staking('0xB940D63c2deD1184BbdE059AcC7fEE93654F02bf', '0x5de8ab7e27f6e7a1fff3e5b337584aa43961beef')
  },
}
