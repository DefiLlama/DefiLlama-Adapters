const ADDRESSES = require("../helper/coreAssets.json");
const { staking } = require("../helper/staking");
const { pool2Exports } = require("../helper/pool2");


module.exports = {
  methodology: "Counts USDC deposited to trade and to mint BLP. Staking counts BSM and esBSM deposited to earn esBSM",

  base: {
    start: 1700488,
    tvl: staking("0xEDFFF5d0C68cFBd44FA12659Fd9AD55F04748874", ADDRESSES.base.USDbC),
    staking: pool2Exports("0xe2cb504d51fd16d8bdf533c58553ed3f4f755f00", ["0xC5Dc1b9413c47089641D811B6336c0f2fE440883","0xd2eb1de935fe66501aece023b0437fa7b9c40a25"], "base"),
  }

};
