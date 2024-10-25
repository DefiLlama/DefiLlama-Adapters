
const { stakings } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");

const stakingAddresses = ["0x111e34bA90D1dE9a2A57f987b5711C71FA4c0Fa0"];
const stakingToken = "0x14e5386f47466a463f85d151653e1736c0c50fc3";
const pool2StakingAddresses = ["0xEAf6E84B4E4C2Ce70a80fd781B6A7f177E7b60F5", "0xb94380939A15C574FE22B04FC95Ec5CCaAD783b8"];
const lpTokens = ["0x6495b61b8088a0a82de737ffb142136119b016e6", "0x464b7eb1c66d662e652dfbfced35d465498ad9ac"];

module.exports = {
  polygon: {
    tvl: () => 0,
    staking: stakings(stakingAddresses, stakingToken, "polygon"),
    pool2: pool2s(pool2StakingAddresses, lpTokens, "polygon")
  },
  methodology: "Counts total value locked as the $RUM token staking, LP token staking",
}