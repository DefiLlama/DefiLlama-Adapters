const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      chain: 'bsc',
      factory: '0x8BA1a4C24DE655136DEd68410e222cCA80d43444',
      useDefaultCoreAssets: true,
    }),
  },
  // ethereum: {
  //   tvl: getUniTVL({
  //     chain: 'ethereum',
  //     factory: '0x5Fc2b10Efb7C202Ab84ffF9Ea54d240280421D4b',
  //     useDefaultCoreAssets: true,
  //   }),
  // },
  cronos: {
    tvl: getUniTVL({
      chain: 'cronos',
      factory: '0x5019EF5dd93A7528103BB759Bb2F784D065b826a',
      useDefaultCoreAssets: true,
    }),
  },
  bitgert: {
    tvl: getUniTVL({
      chain: 'bitgert',
      factory: '0xd4688F52e9944A30A7eaD808E9A86F95a0661DF8',
      useDefaultCoreAssets: true,
    }),
  },
};
