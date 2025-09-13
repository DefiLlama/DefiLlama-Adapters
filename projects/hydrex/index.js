const { uniV3Export } = require("../helper/uniswapV3");

const HYDREX_ALGEBRA_FACTORY = "0x36077D39cdC65E1e3FB65810430E5b2c4D5fA29E"

module.exports = uniV3Export({
    base: {
        factory: HYDREX_ALGEBRA_FACTORY,
        fromBlock: 31648963,
        isAlgebra: true
    }
});