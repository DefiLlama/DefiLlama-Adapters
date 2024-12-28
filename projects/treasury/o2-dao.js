const { treasuryExports, } = require("../helper/treasury");


module.exports = treasuryExports({
  avax: {
    tokens: [
      '0x321E7092a180BB43555132ec53AaA65a5bF84251',
      '0x7bc2561d69b56fae9760df394a9fa9202c5f1f11',
      '0x0da67235dd5787d67955420c84ca1cecd4e5bb3b',
    ],
    owners: ['0x10c12b7322ac2c5a26bd9929abc6e6b7997570ba'],
    resolveLP: true,
    ownTokens: ['0xaa2439dbad718c9329a5893a51a708c015f76346']
  },
})
