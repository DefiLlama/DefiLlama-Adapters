const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({ 
    pulse: { factory: '0xe50dbdc88e87a2c92984d794bcf3d1d76f619c68', fromBlock: 18942139, } ,
    base: { factory: '0x7b72C4002EA7c276dd717B96b20f4956c5C904E7', fromBlock: 15754625, }
})