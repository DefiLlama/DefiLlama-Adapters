const sdk = require("@defillama/sdk");
const { mergeExports } = require('../helper/utils')
const { sumTokens2, } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");
const { transformArbitrumAddress } = require("../helper/portedTokens");
const chain = 'arbitrum';
const abi = require('./abi.json');
const vault = "0xA7Ce4434A29549864a46fcE8662fD671c06BA49a";
const stakingAdd = "0x8A19F6BC381caf24C7122296AA51047105924074";
const GMDaddress = "0x4945970EfeEc98D393b4b979b9bE265A3aE28A8B";
const stakedGLPaddress = "0x1aDDD80E6039594eE970E5872D247bf0414C8903";
const USDC = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";
const FEGLP_ADDRESS = "0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258";

const Tvl = async (timestamp, ethBlock, { arbitrum: block }) => {
  const balances = {};
  const transform = await transformArbitrumAddress();
  const glpvault = (await sdk.api.abi.call({
    abi,
    target: vault,
    params: [],
    chain, 
    block,
  })
 ).output;
 const gmdStaked = (await sdk.api.abi.call({
  abi: 'erc20:balanceOf',
  chain: 'bsc',
  target: GMDaddress,
  params: [stakingAdd],
  chain,
  block,
})).output;

  sdk.util.sumSingleBalance(balances, transform(FEGLP_ADDRESS), glpvault);
  sdk.util.sumSingleBalance(balances, transform(GMDaddress), gmdStaked);

  return balances
}

const vaultTVL= async (timestamp, ethBlock, { arbitrum: block }) => {
  const balances = {};
  const transform = await transformArbitrumAddress();
  const glpvault = (await sdk.api.abi.call({
    abi,
    target: vault,
    params: [],
    chain, 
    block,
  })
 ).output;
 

  sdk.util.sumSingleBalance(balances, transform(FEGLP_ADDRESS), glpvault);

  return balances
}

module.exports = {
    timetravel: true,
    methodology: "staked gmd + vault balance",
    arbitrum: {
      tvl: async () => ({}),
      staking: staking(stakingAdd, GMDaddress, "arbitrum"),
      tvl: Tvl,
      masterchef: vaultTVL
      //staking: staking(vault, stakedGLPaddress,"arbitrum"),
    },
  };


  