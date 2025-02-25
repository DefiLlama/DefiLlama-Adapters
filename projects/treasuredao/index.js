const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

const stakingContract = "0xA0A89db1C899c49F98E6326b764BAFcf167fC2CE";
const MAGIC = "0x539bdE0d7Dbd336b79148AA742883198BBF60342";

const stakingPool2Contract = "0x73EB8b2b235F7957f830ea66ABE433D9EED9f0E3";
const MAGIC_WETH_SLP = "0xB7E50106A5bd3Cf21AF210A755F9C8740890A8c9";

module.exports = {
  misrepresentedTokens: true,
  arbitrum: {
    tvl: (async) => ({}),
    staking: staking(stakingContract, MAGIC),
    pool2: pool2(stakingPool2Contract, MAGIC_WETH_SLP),
  },
  methodology: "Counts liquidty on the staking and pool2 only",
};
