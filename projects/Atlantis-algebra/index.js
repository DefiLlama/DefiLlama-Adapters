const { uniV3Export } = require("../helper/uniswapV3");

const ATLANTIS_ALGEBRA_FACTORY = "0x7C839669a12FAE0BFBE2F6a16516Dd2ADc2F1a1b"

module.exports = uniV3Export({
    sonic: {
        factory: ATLANTIS_ALGEBRA_FACTORY,
        fromBlock: 33883713,
        isAlgebra: true
    }
});