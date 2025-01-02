const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require('../helper/unknownTokens')
const { stakingUnknownPricedLP } = require("../helper/staking.js");

const factory = "0xAffdbEAE1ec595cba4C262Bdb52A6083aEc2e2a6";
const masterchef = "0x53e986884c55c9AEDB7f003583f350EE789505D0";
const ftm = ADDRESSES.fantom.WFTM;
const dfy = "0x84b0b7718f8480a9eda3133fd385d7edf2b1d1c4";
const whitelist = [
  dfy,
  ADDRESSES.fantom.USDC,
  "0x321162cd933e2be498cd2267a90534a804051b11",
];

module.exports = {
  misrepresentedTokens: true,
  echelon: {
    tvl: () => ({}),
  },
  fantom: {
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true }),
    staking: stakingUnknownPricedLP(
      masterchef,
      dfy,
      "fantom",
      "0x46c1dccC44c3255A22B8041856cff0dE8f5958D6",
      (addr) => `fantom:${addr}`
    ),
  },
};
