const { stakings } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

const stakingContracts = [
  "0x60C6b5DC066E33801F2D9F2830595490A3086B4e", // DOE earning
  "0xaEbA219f6bf8Ec703a1CF1C4bA540cD4Bafa2fBe", // SHIB earning
];
const DOE = "0xf8e9f10c22840b613cda05a0c5fdb59a4d6cd7ef";

const stakingPool2Contract = "0x3C40601f73fbf50b81a72edbf2786f14EBb7371b";
const DOE_WETH_SLP = "0xd2696e995a2ef33c9b4a3c47f6aa2651beb48b21";

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: stakings(stakingContracts, DOE),
    tvl: (async) => ({}),
  },
  arbitrum: {
    pool2: pool2(stakingPool2Contract, DOE_WETH_SLP),
  },
  methodology: "Counts liquidty on the staking and pool2 only",
};
