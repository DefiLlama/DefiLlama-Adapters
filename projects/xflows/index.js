const { uniV3Export } = require('../helper/uniswapV3')

// xflows factory contract address on WAN chain
const FACTORY = '0xEB3e557f6FdcaBa8dC98BDA833E017866Fc168cb';
// xflows deployment block on WAN chain
const START_BLOCK = 33432686;

// 需要排除的池子地址
const BLACKLISTED_TOKENS = [
  '0xd907b5d927e70aa431fd6a79f91133596414c8a2',
  '0xc75180d1b5498d8b998dfc2d30e819ca39c6e7d9',
];

module.exports = uniV3Export({
  wan: {
    factory: FACTORY,
    fromBlock: START_BLOCK,
    blacklistedTokens: BLACKLISTED_TOKENS,
    permitFailure: true, // 允许单个调用失败
  },
})
