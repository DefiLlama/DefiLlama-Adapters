const { compoundExports } = require("../helper/compound");
const { bigNumberify } = require("../mobiusfinance/utilities/utilities");

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

const stakedNearRealmExport = compoundExports(
  "0xE550A886716241AFB7ee276e647207D7667e1E79",
  "aurora"
);

const bastion = [
  mainHubExport,
  auroraRealmExport,
  multiChainRealmExport,
  stakedNearRealmExport,
];

module.exports = {
  timetravel: true,
  aurora: {
    tvl: async (...args) => {
      let balances = {};
      for (const realm of bastion) {
        const realmBalances = await realm.tvl(...args);
        for (const underlyingAddress of Object.keys(realmBalances)) {
          if (underlyingAddress in balances) {
            balances[underlyingAddress] = bigNumberify(
              balances[underlyingAddress]
            )
              .add(bigNumberify(realmBalances[underlyingAddress]))
              .toString();
          } else {
            balances[underlyingAddress] = realmBalances[underlyingAddress];
          }
        }
      }
      return balances;
    },
    borrowed: async (...args) => {
      let balances = {};
      for (const realm of bastion) {
        const realmBalances = await realm.borrowed(...args);
        for (const underlyingAddress of Object.keys(realmBalances)) {
          if (underlyingAddress in balances) {
            balances[underlyingAddress] = bigNumberify(
              balances[underlyingAddress]
            )
              .add(bigNumberify(realmBalances[underlyingAddress]))
              .toString();
          } else {
            balances[underlyingAddress] = realmBalances[underlyingAddress];
          }
        }
      }
      return balances;
    },
  },
};