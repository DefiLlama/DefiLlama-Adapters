const { stakingTvl } = require('./api');

module.exports = {
  timetravel: false,
  methodology: "Sums the total HDX staked in staking.positions.",
  hydration: {
    tvl: stakingTvl,
  },
};
