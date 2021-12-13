const { staking } = require("../helper/staking.js");
const { pool2 } = require("../helper/pool2.js");

// ETH contracts
const baconToken = "0x34f797e7190c131cf630524655a618b5bd8738e7";
const stakingContract = "0x27FC644f86a5D4Ad0809BFF8EafCc528E5F4e034";

// BACON-USDC Pair
const ethLP = "0xc992a50169f6075d52013118355c633bf92ae853";

// BSC contracts
const bscBaconToken = "0x0615dbba33fe61a31c7ed131bda6655ed76748b1";
const bscStakingContract = "0x1624f949b1c972eA24e9BeeAd7A0f60E201D6eD3";

// BACON-BUSD Pair
const bscPool2Contract = "0x529943544Eb7f1765b4009862420fBd22A6D5eE7";
const bscLP = "0xdf2f838fda9294a7dedb25c815c4f8a3dc30851c";

module.exports = {
  ethereum: {
    tvl: async () => ({}),
    pool2: pool2(stakingContract, ethLP),
    staking: staking(stakingContract, baconToken, "ethereum"),
  },
  bsc: {
    tvl: async () => ({}),
    pool2: pool2(bscPool2Contract, bscLP, "bsc", (addr) => `bsc:${addr}`),
    staking: staking(bscStakingContract, bscBaconToken, "bsc"),
  },
  tvl: async () => ({}),
};
