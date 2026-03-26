const { uniV3Export } = require("../helper/uniswapV3");

const TREBLESWAP_ALGEBRA_FACTORY = "0x6e606Cf94A4DDc01aEed2Fce16d1b4f5B33e0A31"

module.exports = uniV3Export({
    base: {
        factory: TREBLESWAP_ALGEBRA_FACTORY,
        fromBlock: 39029383,
        isAlgebra: true
    }
});
