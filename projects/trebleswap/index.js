const { uniV3Export } = require("../helper/uniswapV3");

const TREBLESWAP_ALGEBRA_FACTORY = "0xAC900f12fB25d514e3ccFE8572B153A9991cA4e7"

module.exports = uniV3Export({
    base: {
        factory: TREBLESWAP_ALGEBRA_FACTORY,
        fromBlock: 25118568,
        isAlgebra: true
    }
});