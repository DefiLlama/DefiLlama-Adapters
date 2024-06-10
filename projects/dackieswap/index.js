const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  base: { factory: "0x3D237AC6D2f425D2E890Cc99198818cc1FA48870", fromBlock: 2031627 },
  optimism: { factory: "0xc2BC7A73613B9bD5F373FE10B55C59a69F4D617B", fromBlock: 115172042 },
  arbitrum: { factory: "0xaEdc38bD52b0380b2Af4980948925734fD54FbF4", fromBlock: 180722131 },
  blast: { factory: "0xd1575B2e0C82fba9Eddc3de9c9AAF923AFA670cC", fromBlock: 286237 },
  inevm: { factory: "0xf79A36F6f440392C63AD61252a64d5d3C43F860D", fromBlock: 291933 },
  mode: { factory: "0xc6f3966E5D08Ced98aC30f8B65BeAB5882Be54C7", fromBlock: 6102035 },
  xlayer: { factory: "0xc6f3966e5d08ced98ac30f8b65beab5882be54c7", fromBlock: 278971 },
});