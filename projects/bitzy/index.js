const { uniTvlExports } = require('../helper/unknownTokens')
const { uniV3Export } = require("../helper/uniswapV3");
const sdk = require('@defillama/sdk');

const tvlV2 = uniTvlExports({
  btnx: '0xDF2CA43f59fd92874e6C1ef887f7E14cb1f354dD'
})

const tvlV3 = uniV3Export({
  btnx: { factory: "0xa8C00286d8d37131c1d033dEeE2F754148932800", fromBlock: 186643, blacklistedOwners: [
    '0xADC57668ccDaebFb356A49c461A18dB59C122d9B', // USDa/sUSDa pool - unproductive assets
  ] },
})

module.exports = {
  btnx: {
    tvl: sdk.util.sumChainTvls([
      tvlV2.btnx.tvl,
      tvlV3.btnx.tvl
    ]),
  },
};