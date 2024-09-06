
const { stakings } = require("../helper/staking");

const sashimidaoStakings = [
  "0x7dCb04c9e60B52E23f0F46FE2E5D00B234402dAA",
  "0xcf95dEfc57D91c4711C0d9009E1eF63B0936dD7e",
];
const SASHI = "0xb88e3edb378ed7ddef10b86962d97fa0b8defb6d"; // SASHI is not on coingecko yet!!!

module.exports = {
  hallmarks: [
    [1642464000, "Rug Pull"]
  ],
  deadFrom: 1642464000,
  misrepresentedTokens: true,
  avax: {
    staking: stakings(sashimidaoStakings, SASHI),
    tvl: () => ({}),
  },
  methodology: "Counts MIM and TLP (SASHI-MIM) on the treasury",
};
