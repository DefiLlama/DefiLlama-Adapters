/*
 * Stakingverse adapter for DefiLlama
 * Tracks TVL for LUKSO staking 
 */

const STAKING_CONTRACT = '0x9F49a95b0c3c9e2A6c77a16C177928294c0F6F04';
const SLYX_TOKEN_CONTRACT = '0x8a3982f0a7d154d11a5f43eec7f50e52ebbc8f7d';
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

/**
 * Pool2 function - calculates the total value of liquid staking tokens (sLYX)
 * converted to their underlying LYX value based on the current exchange rate
 */
async function pool2(api) {
  // Get total sLYX supply
  const totalSLYXSupply = await api.call({
    target: SLYX_TOKEN_CONTRACT,
    abi: 'function totalSupply() view returns (uint256)'
  });
  
  // Get the exchange rate between sLYX and LYX
  const exchangeRate = await api.call({
    target: SLYX_TOKEN_CONTRACT,
    abi: 'function getExchangeRate() view returns (uint256)'
  });
  
  // Convert sLYX to LYX value using the exchange rate
  // exchangeRate is in 1e18 format (1.0 = 1e18)
  const slyxValueInLYX = (BigInt(totalSLYXSupply) * BigInt(exchangeRate)) / BigInt(1e18);
  
  // Add the LYX value to represent sLYX tokens - using the native token's address
  api.add(LYX_ADDRESS, slyxValueInLYX);

  return api.getBalances();
}

module.exports = {
  methodology: 'Total Value Locked (TVL) consists of LYX tokens staked in the Stakingverse staking protocol. Pool2 represents the total supply of sLYX liquid staking tokens, converted to their underlying LYX value using the current exchange rate from the contract. This follows the standard liquid staking methodology of tracking both the original staked tokens and the rebasing tokens without double counting.',
  start: 1975213, // Deployment block of staking protocol
  hallmarks: [
    [1735507440, "Deployment of sLYX liquid staking token (block 4084835)"]
  ],
  lukso: {
    tvl,
    pool2,
  }
};