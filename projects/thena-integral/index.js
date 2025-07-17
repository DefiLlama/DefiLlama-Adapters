const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  bsc: { factory: "0x30055F87716d3DFD0E5198C27024481099fB4A98", fromBlock: 44121855, isAlgebra: true, blacklistedTokens: ['0x39e3ca118ddfea3edc426b306b87f43da3251b4a'] },
});

