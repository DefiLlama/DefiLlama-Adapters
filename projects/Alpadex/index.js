const { getChainTvl } = require("../helper/getUniSubgraphTvl");
const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");
const { staking } = require("../helper/staking.js");

const v1graph = getChainTvl(
  {
    moonriver:
      "https://api.thegraph.com/subgraphs/name/alphadex1/alphadex-exchange"
  },
  "alphadexFactories",
  "totalLiquidityUSD"
);

const ROAR_TOKEN_ADDRESSES = {
  moonriver: "0x8E7Cd893D8f371051a39aA65976Bca22d7b02A60"
};

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  moonriver: {
    tvl: v1graph("moonriver")
  }
};
