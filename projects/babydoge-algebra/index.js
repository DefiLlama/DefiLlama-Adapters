const { uniV3Export } = require("../helper/uniswapV3");

const BABYDOGE_ALGEBRA_FACTORY = "0xDA3285630Ee68b94E9BA484e11512f586634D593"

module.exports = uniV3Export({
    bsc: {
        factory: BABYDOGE_ALGEBRA_FACTORY,
        fromBlock: 54100671,
        isAlgebra: true
    }
});