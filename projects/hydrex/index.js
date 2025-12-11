const { uniV3Export } = require("../helper/uniswapV3");

const HYDREX_ALGEBRA_FACTORY = "0x36077D39cdC65E1e3FB65810430E5b2c4D5fA29E"

module.exports = uniV3Export({
    base: {
        factory: HYDREX_ALGEBRA_FACTORY,
        fromBlock: 31648963,
        isAlgebra: true,
        blacklistedTokens: ['0x8d9a525463e6891bca541828ddd5c9551d8d6697', '0x995bb7f2fc1c628f029baf04204b7b6ab6667271', '0x893ade07ce949d9686267898a31fb9660c264276']
    }
});