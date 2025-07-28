const { aaveExports, methodology, } = require("../helper/aave");

module.exports = {
  methodology,
  oas: aaveExports("oas", '0xf4A3dDC5F629d9CB14DF4e7d5f78326153eA02A3', undefined, undefined, {
    abis: {
      getAllATokens: "function getAllLTokens() view returns (tuple(string symbol, address tokenAddress)[])"
    },
  }),
};
