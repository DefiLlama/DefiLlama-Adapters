const { sumTokensExport } = require("../helper/unwrapLPs");

const bscStaking = "0xa1f61Ca61fe8655d2a204B518f6De964145a9324";
const bscStakingV2 = "0xffC7B93b53BC5F4732b414295E989684702D0eb5";

const bscTokens = {
  TEM: "0x19e6BfC1A6e4B042Fb20531244D47E252445df01",
};

module.exports = {
  bsc: {
    staking: sumTokensExport({
      owners: [bscStaking, bscStakingV2],
      tokens: [bscTokens.TEM],
    }),
    tvl: () => 0,
  },
  ethereum: {
    tvl: () => 0,
    staking: () => 0,
  },
  moonriver: {
    tvl: () => 0,
    staking: () => 0,
  },
  harmony: {
    tvl: () => 0,
    staking: () => 0,
  },
};