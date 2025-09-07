const { uniV3Export } = require("../helper/uniswapV3");

const FOMOSWAP_ALGEBRA_FACTORY = "0x10253594A832f967994b44f33411940533302ACb"

module.exports = uniV3Export({
    tara: {
        factory: FOMOSWAP_ALGEBRA_FACTORY,
        fromBlock: 20173658,
        isAlgebra: true
    }
});