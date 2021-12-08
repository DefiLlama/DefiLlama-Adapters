const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const GgStaking = "0xBD79c01140CeE7040f8F5E935B72e13540a801b6"
const gg = "0xF2F7CE610a091B94d41D69f4fF1129434a82E2f0"

// https://app.galaxygoggle.money/#/bonds
const treasury = "0xD5F922e23693e552793fE0431F9a95ba67A60A23"
const dao = "0xDEEdd1646984F9372Cc9D3d7E13AC1606cC2B548"
const mim = "0x130966628846BFd36ff31a822705796e8cb8C18D"
const wavax = "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7"
const joe = "0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd"

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [mim, false],
      [wavax, false],
      [joe, false],
      ["0xe9E8d6b6ce6D94Fc9d724711e80784Ec096949Fc", true], // mim-gg
    ],
    [treasury, dao],
    chainBlocks.avax,
    'avax',
  );

  return balances;
}

module.exports = {
  avalanche: {
    tvl,
    staking: staking(GgStaking, gg, "avax")
  },
  methodology:
    "Counts tokens on the treasury for tvl and staked GG for staking",
};
