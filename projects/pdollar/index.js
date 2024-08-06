const { staking, } = require("../helper/staking");
const { pool2 } = require('../helper/pool2')

const spdoTokenAddress = "0x1D3918043d22de2D799a4d80f72Efd50Db90B5Af";
const spdoRewardPoolAddress = "0xe8E0f521433028718baa338467151A3D43974292";
const boardroomAddress = "0x82D868D99747fbF9FDff367Bb9f1c55112B05c7F";

const ftmLPs = [
  "0xd339d12C6096Cb8E16a2BcCB5ACacA362bE78EA7", // pdoDaiLpAddress
  "0x5FBbd691e7d998fe6D5059B9BFa841223c018c31", // spdoDaiLpAddress
];

module.exports = {
  methodology: "Pool2 deposits consist of PDO/DAI and sPDO/DAI LP tokens deposits while the staking TVL consists of the sPDO tokens locked within the Boardroom contract(0x82D868D99747fbF9FDff367Bb9f1c55112B05c7F).",
  fantom: {
    tvl: async () => ({}),
    pool2: pool2(spdoRewardPoolAddress, ftmLPs),
    staking: staking(boardroomAddress, spdoTokenAddress),
  },
};