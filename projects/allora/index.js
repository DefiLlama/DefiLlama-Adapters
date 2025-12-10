const { queryV1Beta1 } = require('../helper/chain/cosmos');

async function getCosmosStaking() {
  const pool = await queryV1Beta1({ 
    chain: 'allora',
    url: 'staking/v1beta1/pool' 
  });
  
  return pool.pool.bonded_tokens || '0';
}

async function getReputationalStaking() {
  // Reputational staking endpoint not yet available
  return '0';
}

async function tvl(api) {
  // Staking is tracked separately
}

async function staking() {
  const validatorStaking = await getCosmosStaking();
  const reputationalStaking = await getReputationalStaking();
  
  const totalStakedUallo = BigInt(validatorStaking) + BigInt(reputationalStaking);
  const totalStakedAllo = totalStakedUallo / BigInt(1e18); // 18 decimals
  
  return {
    'allora': Number(totalStakedAllo)
  };
}

module.exports = {
  methodology: 'Tracks validator staking on Allora Chain via Cosmos SDK staking module. Reputational staking (workers/reputers) will be added when REST endpoint becomes available.',
  
  timetravel: false,
  
  allora: {
    tvl,
    staking
  },
  
  hallmarks: [
    [1731283200, "Mainnet Launch"],
  ],
};
