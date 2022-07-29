const { getUniTVL } = require("../helper/unknownTokens");
const { stakingPricedLP } = require("../helper/staking");

const FACTORIES = "0xA9473608514457b4bF083f9045fA63ae5810A03E";
const NATIVE_TOKEN_WASTAR = "0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720";

const TOKENS = {
  WASTAR: NATIVE_TOKEN_WASTAR,
  WETH: "0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c",
  WBTC: "0xad543f18cFf85c77E140E3E5E3c3392f6Ba9d5CA",
  WBNB: "0x7f27352D5F83Db87a5A3E00f4B07Cc2138D8ee52",
  WSDN: "0x75364D4F779d0Bd0facD9a218c67f87dD9Aff3b4",
  MATIC: "0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF",
  USDC: "0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98",
  USDT: "0x3795C36e7D12A8c252A20C5a7B455f7c57b60283",
  ARSW: "0xDe2578Edec4669BA7F41c5d5D2386300bcEA4678",
  DOT: "0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF",
};

const STAKING_CONTRACTS = {
  astar: "0x42d175a498Cb517Ad29d055ea7DcFD3D99045404",
};

module.exports = {
  timetravel: true,
  methodology: "Arthswap Tvl Calculation",
  astar: {
    tvl: getUniTVL({
      factory: FACTORIES,
      chain: 'astar',
      coreAssets: Object.values(TOKENS),
    }),
    staking: stakingPricedLP(
      STAKING_CONTRACTS.astar,
      TOKENS.ARSW,
      "astar",
      "0x50497E7181eB9e8CcD70a9c44FB997742149482a",
      "arthswap"
    ),
  },
};
