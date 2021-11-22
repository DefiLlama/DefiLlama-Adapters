const { staking } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const templeStakingContract = "0x4D14b24EDb751221B3Ff08BBB8bd91D4b1c8bc77";
const TEMPLE = "0x470ebf5f030ed85fc1ed4c2d36b9dd02e77cf1b7";

const templeTreasuryContract = "0x22c2fE05f55F81Bf32310acD9a7C51c4d7b4e443";
const FRAX = "0x853d955acef822db058eb8505911ed77f175b99e";

async function treasuryTvl() {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [FRAX, false],
    ],
    [templeTreasuryContract]
  );

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: staking(templeStakingContract, TEMPLE),
    tvl: treasuryTvl,
  },
  methodology:
    "Counts tvl on the treasury through TempleTreasury Contract",
};
