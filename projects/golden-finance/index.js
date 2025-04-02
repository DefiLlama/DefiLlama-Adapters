const { staking } = require("../helper/staking");
const { gmxExports } = require("../helper/gmx");

const zetaVault = "0xea8bC5EF6327f666823AefC56Cd2afe47cD2d0d7";

module.exports = {
  zeta: {
    tvl: gmxExports({ vault: zetaVault }),
  },
};
