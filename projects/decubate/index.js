const sdk = require('@defillama/sdk');
const { staking } = require('../helper/staking');
const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs');

// Decubate contracts
const DCBToken = "0xEAc9873291dDAcA754EA5642114151f3035c67A2";
const stakingContracts = [
  "0xD1748192aE1dB982be2FB8C3e6d893C75330884a", // Legacy staking pools contract
  "0xe740758a8cd372c836857defe8011e4e80e48723", // New staking pools contract
];
const LPContractAddress = "0x83D5475BC3bFA08aC3D82ba54b4F86AFc5444398"; // LP Pool Contract
const stakingPoolContract = "0x1587D7bF992A854A23FFd7b1Bcf96393d978dFAE"; // Contract that holds the LP Pool

async function tvl(timestamp, block) {
  let balances = {};

  // Fetch balances from liquidity pools (DCB/USDT)
  await sumTokensAndLPsSharedOwners(
    balances,
    [[DCBToken, LPContractAddress]], 
    [stakingPoolContract],
    block
  );

  return balances;
}

async function stakingTvl(block) {
  const balances = {};

  // Fetch staked balances for legacy and new staking pools
  await Promise.all(
    stakingContracts.map(contract => 
      staking(contract, DCBToken, "bsc", balances, block))
  );

  return balances;
}
