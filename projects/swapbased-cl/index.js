const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  base: {
    hallmarks: [
      [1714957200,"change contracts"]
    ],
    factory: "0xb5620F90e803C7F957A9EF351B8DB3C746021BEa", //replace factory , from algebra dex to pancake v3 (univ3)
    fromBlock: 13766585,
  },
});