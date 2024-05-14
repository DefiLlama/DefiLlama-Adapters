const { uniV3Export } = require("../helper/uniswapV3");
const factory = "0x79Ea1b897deeF37e3e42cDB66ca35DaA799E93a3";

module.exports = uniV3Export({
    core: { factory, fromBlock: 512861 },
});
