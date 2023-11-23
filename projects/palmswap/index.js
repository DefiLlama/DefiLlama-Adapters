const { gmxExports } = require("../helper/gmx");
const { staking } = require("../helper/staking");

const palmswapVault = "0x0cD6709ba5972eDc64414fd2aeC7F8a891718dDa"; //Vault

const palmTokenStakingContract = "0x53ce47f3a148Fcb1F96E1Bf6F0a47D041D8d3788"; //RewardTracker
const palmToken = "0x29745314B4D294B7C77cDB411B8AAa95923aae38"; //PALM token address

module.exports = {
  bsc: {
    tvl: gmxExports({ vault: palmswapVault, permitFailure: true, }),
    staking: staking(palmTokenStakingContract, palmToken),
  },
};
