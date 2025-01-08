const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  base: { factory: "0x3D237AC6D2f425D2E890Cc99198818cc1FA48870", fromBlock: 2031627 },
  optimism: { factory: "0xc2BC7A73613B9bD5F373FE10B55C59a69F4D617B", fromBlock: 115172042 },
  mode: { factory: "0xc6f3966E5D08Ced98aC30f8B65BeAB5882Be54C7", fromBlock: 6102035 },
  wc: { factory: "0xB9010964301326160173da694c0697a2FcE82F39", fromBlock: 4523073 },
});