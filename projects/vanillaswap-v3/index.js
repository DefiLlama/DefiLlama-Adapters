const { uniV3Export } = require("../helper/uniswapV3");
const factory = "0x9C444DD15Fb0Ac0bA8E9fbB9dA7b9015F43b4Dc1";

module.exports = uniV3Export({
    defichain_evm: { factory, fromBlock: 147204 },
})