const { uniTvlExports } = require('../helper/unknownTokens')
const { uniV3Export } = require("../helper/uniswapV3");
const sdk = require('@defillama/sdk')

const uniV2Exports = uniTvlExports({
  taiko: '0x2EA9051d5a48eA2350b26306f2b959D262cf67e1'
})

const uniV3Exports = uniV3Export({
  taiko: {
    factory: "0xfCA1AEf282A99390B62Ca8416a68F5747716260c",
    fromBlock: 105000,
  },
});

module.exports = {
  taiko: {
    tvl: sdk.util.sumChainTvls([uniV2Exports.taiko.tvl, uniV3Exports.taiko.tvl])
  }
}