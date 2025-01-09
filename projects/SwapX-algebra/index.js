const { uniV3Export } = require("../helper/uniswapV3");

const SWAPX_ALGEBRA_FACTORY = "0x8121a3F8c4176E9765deEa0B95FA2BDfD3016794"

module.exports = uniV3Export({
    sonic: {
        factory: SWAPX_ALGEBRA_FACTORY,
        fromBlock: 1440914,
        isAlgebra: true
    }
});