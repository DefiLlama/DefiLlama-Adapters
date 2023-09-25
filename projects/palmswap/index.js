const { gmxExports } = require("../helper/gmx");
const { staking } = require("../helper/staking");

const palmswapVault = "0x806f709558CDBBa39699FBf323C8fDA4e364Ac7A"; //Vault

const palmTokenStakingContract = "0x95fc6f7df412040a815494cf27fbc82be6c7585c"; //RewardTracker
const palmToken = "0x29745314B4D294B7C77cDB411B8AAa95923aae38"; //PALM token address

module.exports = {
  bsc: {
    tvl: gmxExports({ vault: palmswapVault }),
    staking: staking(palmTokenStakingContract, palmToken),
  },
};
