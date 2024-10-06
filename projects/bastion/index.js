const { compoundExports } = require("../helper/compound");

const mainHubExport = compoundExports(
  "0x6De54724e128274520606f038591A00C5E94a1F6",
  "0x4E8fE8fd314cFC09BDb0942c5adCC37431abDCD0",
  "0xc9bdeed33cd01541e1eed10f90519d2c06fe3feb"
);

const auroraRealmExport = compoundExports("0xA195b3d7AA34E47Fb2D2e5A682DF2d9EFA2daF06",);
const multiChainRealmExport = compoundExports("0xe1cf09BDa2e089c63330F0Ffe3F6D6b790835973",);
const stakedNearRealmExport = compoundExports("0xE550A886716241AFB7ee276e647207D7667e1E79",);

const bastion = [
  mainHubExport,
  auroraRealmExport,
  multiChainRealmExport,
  stakedNearRealmExport,
];

module.exports = {
  aurora: {
    tvl: async (...args) => {
      await Promise.all(bastion.map(realm => realm.tvl(...args)))
      return args[0].getBalances();
    },
    borrowed: async (...args) => {
      await Promise.all(bastion.map(realm => realm.borrowed(...args)))
      return args[0].getBalances();
    },
  },
};