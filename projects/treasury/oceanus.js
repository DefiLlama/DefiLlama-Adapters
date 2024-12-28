const { staking } = require("../helper/staking");

const treasuryContract = "0xF29EEC2563b1E6a1ed87ff7DDfB164474d1Ecb50";

const SEA = "0x41607272ce6f2a42732ae382f00f8f9ce68d78f3";

module.exports = {
  metis: {
    tvl: (async) => ({}),
    ownTokens: staking(treasuryContract, SEA),
  },
};
