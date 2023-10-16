const { uniV3Export } = require("../helper/uniswapV3");
const { uniTvlExport } = require("../helper/unknownTokens");
const v2factory = "0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865";
module.exports = {
  v1: uniTvlExport("avax", "0xc009a670e2b02e21e7e75ae98e254f467f7ae257"),
  v2: uniV3Export({
    avax: {
      v2factory,
      fromBlock: 26956207,
    },
  }),
};
