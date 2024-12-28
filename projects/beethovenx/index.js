const { onChainTvl } = require("../helper/balancer");

module.exports = {
  fantom: {
    tvl: onChainTvl('0x20dd72ed959b6147912c2e529f0a0c651c33c9ce', 16896080),
  },
  optimism: {
    tvl: onChainTvl('0xBA12222222228d8Ba445958a75a0704d566BF2C8', 7003431),
  },
  sonic: {
    tvl: onChainTvl('0xBA12222222228d8Ba445958a75a0704d566BF2C8', 368312),
  },
};
