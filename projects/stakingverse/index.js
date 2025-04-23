/*
 * Stakingverse adapter for DefiLlama
 * Tracks TVL for LUKSO staking 
 */

const STAKING_CONTRACT = '0x9F49a95b0c3c9e2A6c77a16C177928294c0F6F04';
const SLYX_TOKEN_CONTRACT = '0x8a3982f0a7d154d11a5f43eec7f50e52ebbc8f7d'; // Liquid staking token - kept for reference
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
  methodology: 'Total Value Locked (TVL) consists of LYX tokens staked in the Stakingverse liquid staking protocol.',
  start: 1975213, // Deployment block of staking protocol
  hallmarks: [
    [1735507440, "Deployment of sLYX liquid staking token (block 4084835)"]
  ],
  lukso: {
    tvl,
  }
};