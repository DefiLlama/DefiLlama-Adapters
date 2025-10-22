const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
    ethereum: { factory: "0xD9CE49caf7299DaF18ffFcB2b84a44fD33412509", fromBlock: 21036458 },
    shibarium: {
        factory: "0x2996B636663ddeBaE28742368ed47b57539C9600", fromBlock: 7518119
    },
})