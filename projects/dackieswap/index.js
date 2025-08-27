const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  base: { factory: "0x3D237AC6D2f425D2E890Cc99198818cc1FA48870", fromBlock: 2031627 },
  optimism: { factory: "0xc2BC7A73613B9bD5F373FE10B55C59a69F4D617B", fromBlock: 115172042 },
  mode: { factory: "0xc6f3966E5D08Ced98aC30f8B65BeAB5882Be54C7", fromBlock: 6102035 },
  wc: { factory: "0xB9010964301326160173da694c0697a2FcE82F39", fromBlock: 4523073 },
  arbitrum: { factory: "0x507940c2469e6E3B33032F1d4FF8d123BDDe2f5C", fromBlock: 180404938 },
  unichain: { factory: "0x507940c2469e6E3B33032F1d4FF8d123BDDe2f5C", fromBlock: 21155043 },
  linea: { factory: "0xc6255ec7CDb11C890d02EBfE77825976457B2470", fromBlock: 8488016 },
  blast: { factory: "0xCFC8BfD74422472277fB5Bc4Ec8851d98Ecb2976", fromBlock: 8239180 },
  xlayer: { factory: "0xc6f3966E5D08Ced98aC30f8B65BeAB5882Be54C7", fromBlock: 278971 },
  ethereum: { factory: "0x1a4b306ba14d3fb8a49925675f8edb7ef607c422", fromBlock: 22866686 },
});