const { staking } = require("../helper/staking");

const stakingContractETH = "0x4a9D6b95459eb9532B7E4d82Ca214a3b20fa2358";
const FEG_ETH = "0x389999216860ab8e0175387a0c90e5c52522c945";

const stakingContractBSC = "0xF8303c3ac316b82bCbB34649e24616AA9ED9E5F4";
const FEG_BSC = "0xacfc95585d80ab62f67a14c566c1b7a49fe91167";

module.exports = {
  timetravel:true,
  misrepresentedTokens: true,
  ethereum: {
    staking: staking(stakingContractETH, FEG_ETH)
  },
  bsc: {
    staking: staking(stakingContractBSC, FEG_BSC),
    tvl: async ()=>({}),
  },
  methodology:
    "We count liquidity of FEG token staked on ETHEREUM and BSC chains through their Staking Contracts",
};
