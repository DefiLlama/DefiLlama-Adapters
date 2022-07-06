const { getUniTVL, staking, } = require('../helper/unknownTokens')
const wbnb = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
const pod = '0xdded222297b3d08dafdac8f65eeb799b2674c78f'

module.exports = {
  bsc: {
    tvl: getUniTVL({
      chain: 'bsc',
      factory: '0xabc26f8364cc0dd728ac5c23fa40886fda3dd121',
      coreAssets: [
        '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
        '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d', // BUSD
      ]
    }),
    staking: staking( {
      chain: 'bsc',
      owners: ["0xdEe627eaaB378ec57ECfB94b389B718ef3687c0D", "0xdc8715aCFB63cd0BD01a2C3e7De514845FdbcDF7"],
      tokens: [pod],
      coreAssets: [wbnb],
      lps: ['0x85aa60b3e25a7df37ea1ec1f38ef403d536f0489']
    })
  },
}
