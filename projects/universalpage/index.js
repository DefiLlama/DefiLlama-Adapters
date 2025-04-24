/*
 * UniversalPage adapter for DefiLlama
 * Tracks TVL for LUKSO staking 
 */

const STAKING_CONTRACT = '0xa5b37D755B97C272853b9726C905414706A0553a';
const LYX_ADDRESS = '0x0000000000000000000000000000000000000000'; // Native token null address

/**
 * TVL function - calculates the total value of LYX staked in the staking contract
 */
async function tvl(api) {
  // Get total staked LYX using totalAssets() method
  const totalStakedLYX = await api.call({
    target: STAKING_CONTRACT,
    abi: 'function totalAssets() view returns (uint256)'
  });

  // Add native LYX to TVL
  api.add(LYX_ADDRESS, totalStakedLYX);

  return api.getBalances();
}

module.exports = {
  methodology: 'Total Value Locked (TVL) consists of LYX tokens staked in the Universal Page staking protocol.',
  start: 1508358, // Deployment block of staking protocol
  lukso: {
    tvl
  }
};