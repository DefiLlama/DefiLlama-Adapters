const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  harmony: {
    tvl: getUniTVL({
      factory: '0x5d2f9817303b940c9bb4f47c8c566c5c034d9848',
      useDefaultCoreAssets: true,
      blacklist: [
        '0xed0b4b0f0e2c17646682fc98ace09feb99af3ade', // RVRS
      ]
    })
  },
  hallmarks:[
    ['2022-06-23', "Horizon bridge Hack $100m"],
  ],
}
