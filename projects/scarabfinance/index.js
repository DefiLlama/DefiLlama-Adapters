const { staking } = require("../helper/staking");
const { sumTokensExport } = require("../helper/unknownTokens");

const gscarabTokenAddress = "0x6ab5660f0B1f174CFA84e9977c15645e4848F5D6";
const gscarabRewardPoolAddress = "0xc88690163b10521d5fB86c2ECB293261F7771525";
const templeAddress = "0xD00F41d49900d6affd707EC6a30d1Bf7D4B7dE8F";

const ftmLPs = [
  "0x78e70eF4eE5cc72FC25A8bDA4519c45594CcD8d4", // scarabFtmLpAddress
  "0x27228140d72a7186f70ed3052c3318f2d55c404d", //gscarabFtmLpAddress
];

module.exports = {
  fantom: {
    tvl: async () => ({}),
    pool2: sumTokensExport({ owner: gscarabRewardPoolAddress, tokens: ftmLPs, }),
    staking: staking(templeAddress, gscarabTokenAddress),
  },
};