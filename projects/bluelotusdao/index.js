const { uniV3Export } = require("../helper/uniswapV3");
const factory = "0x5c4619104985163b3839dA465232B6D2a9588E7B";

module.exports = uniV3Export({
    genesys: { factory, fromBlock: 4725924 },
});