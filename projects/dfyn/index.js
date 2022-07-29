const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  polygon:{
    tvl: getUniTVL({
      chain: 'polygon',
      factory: '0xE7Fb3e833eFE5F9c441105EB65Ef8b261266423B',
      coreAssets: [
        '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // USDC
        '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // USDT
        '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', // WETH
      ],
    }),
  },
  okexchain:{
    tvl: getUniTVL({
      factory: '0xE7Fb3e833eFE5F9c441105EB65Ef8b261266423B',
      chain: 'okexchain',
      coreAssets: [
        '0x382bb369d343125bfb2117af9c149795c6c65c50', // tether
        "0xc946daf81b08146b1c7a8da2a851ddf2b3eaaf85", // usdc
        "0x8f8526dbfd6e38e3d8307702ca8469bae6c56c15", // wokt
      ]
    }),
  },
  fantom:{
    tvl: getUniTVL({
      factory: '0xd9820a17053d6314B20642E465a84Bf01a3D64f5',
      chain: 'fantom',
      coreAssets: [
        '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', // wftm
        '0x04068da6c83afcfa0e13ba15a6696662335d5b75', // USDC
        '0x049d68029688eabf473097a2fc38ef61633a3c7a', // USDT
        '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e', // DAI
      ],
    }),
  },
}
