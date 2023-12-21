const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  era: {
    factory: "0x52a1865eb6903bc777a02ae93159105015ca1517",
    fromBlock: 7790768,
  },
  base: {
    factory: "0xeddef4273518b137cdbcb3a7fa1c6a688303dfe2",
    fromBlock: 2753388
  },
  op_bnb: {
    factory: "0xb91331Ea9539ee881e3A45191076c454E482dAc7",
    fromBlock: 3521514
  }
});
