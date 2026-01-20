const { onChainTvl } = require('../helper/balancer')

module.exports = {
  mantle: {
    tvl: onChainTvl('0x1AA7f1f5b51fe22478e683466232B5C8fc49407f', 10790, {
      blacklistedTokens: [
        '0xf7dfe223e19701a514e78f3ce7ba98f2c5fbb5b2',
        '0xa84bdecd44e6cee1c588a3c97fcc4482831fde05',
        '0x62959ad021402f48d0d8067bc5c4c03f63fceaa4',
        '0x8348b81b9ed72f29e52027c349f30703b42c0110'
      ]
    }),
  },
  deadFrom: '2024-10-08',
}
