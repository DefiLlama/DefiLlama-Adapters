const { uniV3Export } = require('../helper/uniswapV3')
module.exports = uniV3Export({
  vana: { factory: '0xc2a0d530e57B1275fbce908031DA636f95EA1E38', fromBlock: 763744, blacklistedTokens: ['0xbd2d7c728b224961fdb25ccf2a67eb3c25f5ec52', '0x0238966c595619312c0422f02e1e64f37a06439d'] },
})