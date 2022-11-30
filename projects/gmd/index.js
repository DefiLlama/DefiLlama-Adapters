const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const chain = 'arbitrum';
const abi = {"inputs":[],"name":"GLPinVault","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
const vault = "0xA7Ce4434A29549864a46fcE8662fD671c06BA49a";
const stakingAdd = "0x8A19F6BC381caf24C7122296AA51047105924074";
const GMDaddress = "0x4945970EfeEc98D393b4b979b9bE265A3aE28A8B";
const stakedGLPaddress = "0x1aDDD80E6039594eE970E5872D247bf0414C8903";
const GLP_ADDRESS = "0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258";

const Tvl = async (timestamp, ethBlock, { arbitrum: block }) => {
  const balances = {};
  const { output: vaultBalance } = await sdk.api.abi.call({
    target: vault,
    abi,
    chain, block,
  })

  sdk.util.sumSingleBalance(balances, GLP_ADDRESS, vaultBalance, chain);
  return balances
}

module.exports = {
    methodology: "staked gmd + vault balance",
    arbitrum: {
      staking: staking(stakingAdd, GMDaddress, "arbitrum"),
      tvl: Tvl,
    },
  };


  
