const { uniV3Export } = require("../helper/uniswapV3");

const blacklistedTokens = [
  '0x39e3ca118ddfea3edc426b306b87f43da3251b4a',
  '0xe80772eaf6e2e18b651f160bc9158b2a5cafca65',
  '0x5335e87930b410b8c5bb4d43c3360aca15ec0c8c',
]

module.exports = uniV3Export({
  bsc: { factory: "0x306F06C147f064A010530292A1EB6737c3e378e4", fromBlock: 26030310, isAlgebra: true, blacklistedTokens },
});
