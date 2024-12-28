const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  bsc: { factory: "0x306F06C147f064A010530292A1EB6737c3e378e4", fromBlock: 26030310, isAlgebra: true, blacklistedTokens: ['0x39e3ca118ddfea3edc426b306b87f43da3251b4a'] },
});
