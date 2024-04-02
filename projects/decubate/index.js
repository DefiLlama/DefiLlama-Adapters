const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs');
const { staking } = require('../helper/staking')

const DCBToken = "0xEAc9873291dDAcA754EA5642114151f3035c67A2";
const stakingContracts = [
  "0xD1748192aE1dB982be2FB8C3e6d893C75330884a", // Legacy staking pools contract
  "0xe740758a8cd372c836857defe8011e4e80e48723", // New staking pools contract
];
const LPContractAddress = "0x83D5475BC3bFA08aC3D82ba54b4F86AFc5444398"; // LP Pool Contract

// Fetch balances from liquidity pools (DCB/USDT)
async function tvl(timestamp, ethBlock, chainBlocks) {
  const balances = {};

  // Add LP balances
  await sumTokensAndLPsSharedOwners(
    balances,
    [[DCBToken, LPContractAddress]], // The LP token address
    [LPContractAddress], // Corrected: Wrap this in an array
    chainBlocks['bsc'],
    'bsc',
    addr => `bsc:${addr}`
);


  // Add staked balances
  for(const stakingContract of stakingContracts){
    await staking(stakingContract, DCBToken, 'bsc', balances, chainBlocks['bsc']);
  }

  return balances;
}

module.exports = {
  bsc:{
    tvl,
  },
  methodology: `TVL accounts for the DCB tokens staked in the staking contracts and the liquidity on the LP pool. Staking TVL is obtained by calling 'balanceOf' on the staking contracts with the staking token address. LP TVL is calculated by unwrapping the DCB-USDT LP tokens to count the underlying assets.`,
};
