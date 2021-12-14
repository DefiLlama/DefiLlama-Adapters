const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl.js");
const { stakingUnknownPricedLP } = require("../helper/staking.js");

const factory = "0xAffdbEAE1ec595cba4C262Bdb52A6083aEc2e2a6";
const masterchef = "0x53e986884c55c9AEDB7f003583f350EE789505D0";
const ftm = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83";
const dfy = "0x84b0b7718f8480a9eda3133fd385d7edf2b1d1c4";
const whitelist = [
  dfy,
  "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
  "0x321162cd933e2be498cd2267a90534a804051b11",
];

module.exports = {
  misrepresentedTokens: true,
  timetravel: true,
  doublecounted: false,
  fantom: {
    tvl: calculateUsdUniTvl(factory, "fantom", ftm, whitelist, "fantom"),
    staking: stakingUnknownPricedLP(
      masterchef,
      dfy,
      "fantom",
      "0x46c1dccC44c3255A22B8041856cff0dE8f5958D6",
      (addr) => `fantom:${addr}`
    ),
  },
};
