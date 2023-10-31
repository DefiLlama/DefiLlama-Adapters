const { uniV3Export } = require('../helper/uniswapV3')

module.exports = {
    methodology: 'TVL accounts for the liquidity on all AMM pools taken from the factory contract',
    ...uniV3Export({
        base: { factory: '0x67233C258BAeE28b2a7d42ec19fBD0b750a77Cd1', fromBlock: 2048745 },
    })
}
