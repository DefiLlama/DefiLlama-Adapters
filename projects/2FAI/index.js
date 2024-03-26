const { stakings } = require("../helper/staking");

const revShareContract = [
    "0x394a95251135274165837be000d771D5DCb08e15",
];

const tokenVestingUNCX = [
    "0xA82685520C463A752d5319E6616E4e5fd0215e33"
]

const twoFAI = "0x1C1eC1bb5f12F24c97231165B13F3Eab9d4Ec00e"

module.exports = {
  misrepresentedTokens: true,
  base: {
    revSharePool: stakings(revShareContract, twoFAI, 'base'),
    locked: stakings(tokenVestingUNCX, twoFAI, 'base'),
    tvl: async () => ({}),
  },
  methodology: "Counts 2FAI on the rev share pool and locked by team",
}