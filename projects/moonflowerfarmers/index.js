const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const MFF = "0x78B65477bBa78fc11735801D559C386611d07529";
const contract = "0xDE707357D10D86aE21373b290eAbBA07360896F6";

async function staking(timestamp, block) {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [[MFF, false]],
    [contract],
    block["aurora"],
    "aurora",
    (addr) => `aurora:${addr}`
  );

  return balances;
};

module.exports = {
  aurora: {
    tvl: () => ({}),
    staking,
  },
};