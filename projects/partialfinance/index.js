const { staking,  } = require("../helper/staking");
const { pool2 } = require('../helper/pool2')

const pshareTokenAddress = "0x8C64D18E9d4A7b8e8c10C5c5a4b8D6D83cb15002";
const pshareRewardPoolAddress = "0xd5f73D588C3CaCd45B334f873b7B2E7DfaA4cCc7";
const boardroomAddress = "0x5FcE757a1aa5C489B008a4Df6CA2ef9088B5bCA4";

const ftmLPs = [
  "0xe78c2b734F0e7BD708B1a6d79a0cF8937C4DA278", // partialFtmLpAddress
  "0x802ed580E7b48abBfaBf6edC73009705CE210d0b", // pshareFtmLpAddress
]

module.exports = {
  deadFrom: "2024-04-01",
  methodology: "Pool2 deposits consist of PARTIAL/FTM and PSHARE/FTM LP tokens deposits while the staking TVL consists of the PSHARES tokens locked within the Boardroom contract(0x5FcE757a1aa5C489B008a4Df6CA2ef9088B5bCA4).",
  fantom: {
    tvl: async () => ({}),
    pool2: pool2(pshareRewardPoolAddress, ftmLPs),
    staking: staking(boardroomAddress, pshareTokenAddress),
  },
};