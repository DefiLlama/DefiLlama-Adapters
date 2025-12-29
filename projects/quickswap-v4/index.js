const { getConfig } = require("../helper/cache");
const { uniV3Export } = require("../helper/uniswapV3");
const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = uniV3Export({
  base: {
    factory: '0xC5396866754799B9720125B104AE01d935Ab9C7b',
    isAlgebra: true,
    fromBlock: 30736835,
  },
  soneium: {
    factory: '0x8Ff309F68F6Caf77a78E9C20d2Af7Ed4bE2D7093',
    isAlgebra: true,
    fromBlock: 1681559,
  },
  xlayer: {
    factory: '0x0284d1a8336E08AE0D3e30e7B0689Fa5B68E6310',
    isAlgebra: true,
    fromBlock: 3073933,
  },
  somnia: {
    factory: '0x0ccff3D02A3a200263eC4e0Fdb5E60a56721B8Ae',
    isAlgebra: true,
    fromBlock: 40341077,
  },
/*   mantra: {
    factory: '0x10253594A832f967994b44f33411940533302ACb',
    isAlgebra: true,
    fromBlock: 8937027
  } */
})

module.exports.mantra = {
  tvl: async api => {
    const config = await getConfig('quickswap-v4/mantra', 'https://api.quickswap.exchange/utils/search-token-pair/v4?chainId=5888')
    const ownerTokens = config.data.pairs.map(i => [[i.token0.id, i.token1.id], i.id])
    return sumTokens2({ api, ownerTokens, permitFailure: true, })
  }
}