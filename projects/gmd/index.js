const sdk = require("@defillama/sdk");
const { mergeExports } = require('../helper/utils')
const { sumTokens2, } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");
const chain = 'arbitrum';

const vault = "0xA7Ce4434A29549864a46fcE8662fD671c06BA49a";
const stakingAdd = "0x8A19F6BC381caf24C7122296AA51047105924074";
const GMDaddress = "0x4945970EfeEc98D393b4b979b9bE265A3aE28A8B";
const stakedGLPaddress = "0x1aDDD80E6039594eE970E5872D247bf0414C8903";

module.exports = {
    timetravel: true,
    methodology: "staked gmd + vault balance",
    arbitrum: {
      tvl: async () => ({}),
      staking: staking(stakingAdd, GMDaddress, "arbitrum"),
      vault: staking(vault, stakedGLPaddress,"arbitrum"),
    },
  };