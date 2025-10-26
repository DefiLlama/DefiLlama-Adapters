const { 
  queryStakingContract,
  extractTokenBalances,
  JURIS_LENDING_CONTRACT
} = require('./helper');

async function staking(api) {
  const stakingData = await queryStakingContract();
  extractTokenBalances(api, stakingData);
}

async function tvl(api) {
  await staking(api);
  
  // Future lending TVL when contract is deployed
  if (JURIS_LENDING_CONTRACT) {
    // Add lending logic here
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: 'Juris Protocol TVL tracks LUNC, USTC, and JURIS tokens staked in the staking contract on Terra Classic.',
  start: 1698796800,
  terra: {
    tvl,
    staking
  }
};
