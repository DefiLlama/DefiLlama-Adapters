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
  arbitrum: {
    tvl: getUniTVL({
      chain: 'arbitrum',
      factory: '0xabc26f8364cc0dd728ac5c23fa40886fda3dd121',
      useDefaultCoreAssets: true,
    }),
    staking: staking( {
      chain: 'arbitrum',
      owners: ["0xdEe627eaaB378ec57ECfB94b389B718ef3687c0D", "0xdc8715aCFB63cd0BD01a2C3e7De514845FdbcDF7"],
      tokens: [pod],
      useDefaultCoreAssets: true,
      lps: ['0x70348dAEB1cC0DD873481690823552590b71873A']
    })
  },
  optimism: {
    tvl: getUniTVL({
      chain: 'optimism',
      factory: '0xabc26f8364cc0dd728ac5c23fa40886fda3dd121',
      useDefaultCoreAssets: true,
    }),
    staking: staking( {
      chain: 'optimism',
      owners: ["0xdEe627eaaB378ec57ECfB94b389B718ef3687c0D", "0xdc8715aCFB63cd0BD01a2C3e7De514845FdbcDF7"],
      tokens: [pod],
      useDefaultCoreAssets: true,
      lps: ['0xD6E83C3b484F9bd4755e1AD7Bc1a401f6e63e176']
    })
  },
  avax: {
    tvl: getUniTVL({
      chain: 'avax',
      factory: '0xabc26f8364cc0dd728ac5c23fa40886fda3dd121',
      useDefaultCoreAssets: true,
    }),
    staking: staking( {
      chain: 'avax',
      owners: ["0xdEe627eaaB378ec57ECfB94b389B718ef3687c0D", "0xdc8715aCFB63cd0BD01a2C3e7De514845FdbcDF7"],
      tokens: [pod],
      useDefaultCoreAssets: true,
      lps: ['0xA81c921479baD1980e6e47267EeE949a987AB29e']
    })
  },
  polygon: {
    tvl: getUniTVL({
      chain: 'polygon',
      factory: '0xabc26f8364cc0dd728ac5c23fa40886fda3dd121',
      useDefaultCoreAssets: true,
    }),
    staking: staking( {
      chain: 'polygon',
      owners: ["0xdEe627eaaB378ec57ECfB94b389B718ef3687c0D", "0xdc8715aCFB63cd0BD01a2C3e7De514845FdbcDF7"],
      tokens: [pod],
      useDefaultCoreAssets: true,
      lps: ['0x12B880dBDB3e7f49f30644D78e4119fDA510BDfF']
    })
  },
  kava: {
    tvl: getUniTVL({
      chain: 'kava',
      factory: '0xabc26f8364cc0dd728ac5c23fa40886fda3dd121',
      useDefaultCoreAssets: true,
    })
  },
}
