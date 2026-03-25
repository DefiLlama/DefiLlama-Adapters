const { uniV3Export } = require("../helper/uniswapV3")

module.exports = uniV3Export({
    base: {
        factory: '0x0e5Ab24beBdA7e5Bb3961f7E9b3532a83aE86B48',
        fromBlock: 42960000,
        eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, int24 indexed tickSpacing, address pool)',
      },
})
