const { uniV3Export } = require("../helper/uniswapV3");

const ATLANTIS_ALGEBRA_FACTORY = "0x3DFB9096c23dcbF69D62aA009D901328d83A340F"

module.exports = uniV3Export({
    sonic: {
        factory: ATLANTIS_ALGEBRA_FACTORY,
        fromBlock: 23314080,
        isAlgebra: true
    }
});