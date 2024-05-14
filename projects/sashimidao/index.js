
const { stakings } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const sashimidaoStakings = [
  "0x7dCb04c9e60B52E23f0F46FE2E5D00B234402dAA",
  "0xcf95dEfc57D91c4711C0d9009E1eF63B0936dD7e",
];
const SASHI = "0xb88e3edb378ed7ddef10b86962d97fa0b8defb6d"; // SASHI is not on coingecko yet!!!

const treasuryAddress = "0xD4a23b563019cd148Dc148e69a84535cf8368282";
const MIM = "0x130966628846bfd36ff31a822705796e8cb8c18d";
const SASHI_MIM_JLP = "0x71f8DF8A958D5a09694312a79355655F44310084";

/*** Bonds TVL Portion (Treasury) ***
 * Treasury TVL consists of MIM and Trisolaris JLP balances
 ***/
async function avaxTvl(timestamp, chainBlocks) {
  const balances = {};

  let transformAddress = addr => 'avax:'+addr

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [MIM, false],
      [SASHI_MIM_JLP, true],
    ],
    [treasuryAddress],
    chainBlocks["avax"],
    "avax",
    transformAddress
  );

  return balances;
}

module.exports = {
  hallmarks: [
    [1642464000, "Rug Pull"]
  ],
  misrepresentedTokens: true,
  avax: {
    staking: stakings(sashimidaoStakings, SASHI),
    tvl: avaxTvl,
  },
  methodology: "Counts MIM and TLP (SASHI-MIM) on the treasury",
};
