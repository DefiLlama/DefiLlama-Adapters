const { getUniTVL, staking, } = require('../helper/unknownTokens')
const pod = '0xdded222297b3d08dafdac8f65eeb799b2674c78f'

module.exports = {
  bsc: {
    tvl: getUniTVL({
      chain: 'bsc',
      factory: '0xabc26f8364cc0dd728ac5c23fa40886fda3dd121',
      useDefaultCoreAssets: true,
    }),
    staking: staking( {
      chain: 'bsc',
      owners: ["0xdEe627eaaB378ec57ECfB94b389B718ef3687c0D", "0xdc8715aCFB63cd0BD01a2C3e7De514845FdbcDF7"],
      tokens: [pod],
      useDefaultCoreAssets: true,
      lps: ['0x85aa60b3e25a7df37ea1ec1f38ef403d536f0489']
    })
  },
  fantom: {
    tvl: getUniTVL({
      chain: 'fantom',
      factory: '0xabc26f8364cc0dd728ac5c23fa40886fda3dd121',
      useDefaultCoreAssets: true,
    }),
    staking: staking( {
      chain: 'fantom',
      owners: ["0xdEe627eaaB378ec57ECfB94b389B718ef3687c0D", "0xdc8715aCFB63cd0BD01a2C3e7De514845FdbcDF7"],
      tokens: [pod],
      useDefaultCoreAssets: true,
      lps: ['0x48eD248c981d6a97Ba84e21Dd02685951423f59B']
    })
  },
}
