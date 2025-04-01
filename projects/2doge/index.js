const { stakingPricedLP } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

const tshareTokenAddress = "0x0c55339a139acd3a8ba07a9abad345b05c4bf804";
const tshareRewardPoolAddress = "0x60a92645fe34ce7c16f72986e0f980297152535a";
const masonryAddress = "0xe8EA0828FF7BF03c868a2370b83Bc06F50d4eEd9";

const ftmLPs = [
  "0x8DFcA21813df0f0d04157779D489bD30843c6D73", // 2dogeFtmLpAddress
  "0xB254973e067AF44eB4D506e7117A33C4F3F77783", //2sdogeFtmLpAddress
];

module.exports = {
  methodology: "Pool2 deposits consist of 2DOGE/FTM and 2SDOGE/FTM LP tokens deposits while the staking TVL consists of the 2SDOGES tokens locked within the Masonry contract(0xe8EA0828FF7BF03c868a2370b83Bc06F50d4eEd9).",
  fantom: {
    tvl: async () => ({}),
    pool2: pool2(tshareRewardPoolAddress, ftmLPs),
    staking: stakingPricedLP(masonryAddress, tshareTokenAddress, "fantom", "0xB254973e067AF44eB4D506e7117A33C4F3F77783", "fantom"),
  },
  hallmarks: [
    [1646179200, "Rug Pull"]
  ],
  deadFrom: 1646179200
};
