const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  harmony: {
    tvl: getUniTVL({
      factory: '0x5d2f9817303b940c9bb4f47c8c566c5c034d9848',
      chain: 'harmony',
      coreAssets: [
        '0x6983D1E6DEf3690C4d616b13597A09e6193EA013', // WETH
        '0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a', // WHARMONY
        '0x985458e523db3d53125813ed68c274899e9dfab4', // USDC
        '0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f', // USDT
        '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // DAI
      ],
      blacklist: [
        '0xed0b4b0f0e2c17646682fc98ace09feb99af3ade', // RVRS
      ]
    })
  }
}
