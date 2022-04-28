const VortexAPI = require("./vortex.api");
const TzktAPI = require("./tzkt.api");

const tvl = async () => {
  const [stakingTvlUsd, farmsTvl, dexTvlUsd, xtzPrices] = await Promise.all([
    VortexAPI.getTotalStakingTvl(),
    VortexAPI.getFarmsTvl(),
    VortexAPI.getDexTvl(),
    TzktAPI.getXtzPrice(),
  ]);

  const farmsTvlUsd = farmsTvl * xtzPrices.usd;

  return stakingTvlUsd + farmsTvlUsd + dexTvlUsd;
};

module.exports = {
  timetravel: false,
  tezos: {
    tvl,
  },
};
