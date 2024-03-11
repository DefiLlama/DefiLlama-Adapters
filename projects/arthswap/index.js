const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require("../helper/unknownTokens");
const { staking } = require("../helper/staking");

const FACTORIES = "0xA9473608514457b4bF083f9045fA63ae5810A03E";

const arsw = ADDRESSES.astar.ARSW;

const STAKING_CONTRACTS = {
  astar: "0x42d175a498Cb517Ad29d055ea7DcFD3D99045404",
};

module.exports = {
  timetravel: true,
  methodology: "Arthswap Tvl Calculation",
  astar: {
    tvl: getUniTVL({
      factory: FACTORIES,
      useDefaultCoreAssets: true,
    }),
      staking: staking(STAKING_CONTRACTS.astar, arsw, 'astar'),
  },
};
