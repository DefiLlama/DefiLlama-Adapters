const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  ethereum: {
    factory: "0xbACEB8eC6b9355Dfc0269C18bac9d6E2Bdc29C4F",
    fromBlock: 16955547,
  },
  arbitrum: {
    factory: "0x1af415a1EbA07a4986a52B6f2e7dE7003D82231e",
    fromBlock: 75998697,
  },
  optimism: {
    factory: "0x9c6522117e2ed1fE5bdb72bb0eD5E3f2bdE7DBe0",
    fromBlock: 85432013,
  },
  polygon: {
    factory: "0x917933899c6a5F8E37F31E19f92CdBFF7e8FF0e2",
    fromBlock: 41024971,
  },
  arbitrum_nova: {
    factory: "0xaa26771d497814e81d305c511efbb3ced90bf5bd",
    fromBlock: 4242300,
  },
  avax: {
    factory: "0x3e603C14aF37EBdaD31709C4f848Fc6aD5BEc715",
    fromBlock: 28186391,
  },
  bsc: {
    factory: "0x126555dd55a39328F69400d6aE4F782Bd4C34ABb",
    fromBlock: 26976538,
  },
  fantom: {
    factory: "0x7770978eED668a3ba661d51a773d3a992Fc9DDCB",
    fromBlock: 58860670,
  },
  fuse: {
    factory: "0x1b9d177CcdeA3c79B6c8F40761fc8Dc9d0500EAa",
    fromBlock: 22556035,
  },
  xdai: {
    factory: "0xf78031CBCA409F2FB6876BDFDBc1b2df24cF9bEf",
    fromBlock: 27232871,
  },
  moonbeam: {
    factory: "0x2ecd58F51819E8F8BA08A650BEA04Fc0DEa1d523",
    fromBlock: 3264275,
  },
  moonriver: {
    factory: "0x2F255d3f3C0A3726c6c99E74566c4b18E36E3ce6",
    fromBlock: 3945310,
  },
  // boba: { factory: '0x0BE808376Ecb75a5CF9bB6D237d16cd37893d904', fromBlock: 998556, },
  polygon_zkevm: {
    factory: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    fromBlock: 80860,
  },
  thundercore: {
    factory: "0xc35dadb65012ec5796536bd9864ed8773abc74c4",
    fromBlock: 132536332,
  },
});
