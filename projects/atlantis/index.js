const { uniV3Export } = require("../helper/uniswapV3");

const ATLANTIS_ALGEBRA_FACTORY = "0x10253594a832f967994b44f33411940533302acb";

module.exports = uniV3Export({
    monad: {
        factory: ATLANTIS_ALGEBRA_FACTORY,
        fromBlock: 35520610,
        isAlgebra: true
    }
});