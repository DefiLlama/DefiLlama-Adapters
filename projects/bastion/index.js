const { compoundExports } = require("../helper/compound");

const mainHubExport = compoundExports(
  "0x6De54724e128274520606f038591A00C5E94a1F6",
  "aurora",
  "0x4E8fE8fd314cFC09BDb0942c5adCC37431abDCD0",
  "0xc9bdeed33cd01541e1eed10f90519d2c06fe3feb"
);

const auroraRealmExport = compoundExports(
  "0xA195b3d7AA34E47Fb2D2e5A682DF2d9EFA2daF06",
  "aurora"
);

const multiChainRealmExport = compoundExports(
  "0xe1cf09BDa2e089c63330F0Ffe3F6D6b790835973",
  "aurora"
);

const bastion = [mainHubExport, auroraRealmExport, multiChainRealmExport];

module.exports = {
  timetravel: true,
  aurora: {
    tvl: (...args) => {
      return bastion.reduce(
        (total, compoundExports) => (total += compoundExports.tvl(args)),
        0
      );
    },
    borrowed: (...args) => {
      return bastion.reduce(
        (total, compoundExports) => (total += compoundExports.borrowed(args)),
        0
      );
    },
  },
};
