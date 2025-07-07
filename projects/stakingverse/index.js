const ADDRESSES = require('../helper/coreAssets.json')
/*
 * Stakingverse adapter for DefiLlama
 * Tracks TVL for LUKSO staking 
 */

const STAKING_CONTRACT = '0x9F49a95b0c3c9e2A6c77a16C177928294c0F6F04';
const SLYX_TOKEN_CONTRACT = ADDRESSES.lukso.sLYX; // Liquid staking token - kept for reference
const LYX_ADDRESS = ADDRESSES.null; // Native token null address
const ETHEREUM_STAKING_CONTRACT = '0x8A93A876912c9F03F88Bc9114847cf5b63c89f56'; // StakeWise V3 vault on Ethereum

/**
 * TVL function - calculates the total value of LYX staked in the staking contract
 */
async function luksoTvl(api) {
  // Get total staked LYX using totalAssets() method
  const totalStakedLYX = await api.call({
    target: STAKING_CONTRACT,
    abi: 'function totalAssets() view returns (uint256)'
  });

  // Add native LYX to TVL
  api.add(LYX_ADDRESS, totalStakedLYX);

  return api.getBalances();
}

// TVL function for StakeWise V3 vault on Ethereum
async function ethereumTvl(api) {
  const totalStakedETH = await api.call({
    target: ETHEREUM_STAKING_CONTRACT,
    abi: 'function totalAssets() view returns (uint256)'
  });

  // Add native ETH to TVL
  api.add(ADDRESSES.null, totalStakedETH);

  return api.getBalances();
}

module.exports = {
  methodology: 'Total Value Locked (TVL) consists of LYX tokens staked in the Stakingverse liquid staking protocol.',
  start: 1975213, // Deployment block of staking protocol
  hallmarks: [
    [1735507440, "Deployment of sLYX liquid staking token (block 4084835)"]
  ],
  ethereum: {
    tvl: ethereumTvl,
  },
  lukso: {
    tvl: luksoTvl,
  }
};