/**
 * SparkDEX stFLR Liquid Staking - DeFiLlama TVL Adapter
 *
 * stFLR is SparkDEX's liquid staking token for FLR.
 * It allows users to stake FLR while maintaining liquidity.
 *
 * Contract: 0x0988C6ba244A90C07a917ebE609eB3264bE716fF
 * Documentation: https://docs.sparkdex.ai/sparkdex-defi-ecosystem/stflr-liquid-staking
 */

const ADDRESSES = require('../helper/coreAssets.json');

const STFLR_CONTRACT = '0x0988C6ba244A90C07a917ebE609eB3264bE716fF';
const FLR_ADDRESS = ADDRESSES.null; // Native FLR token

async function tvl(api) {
  // Get total pooled FLR from the contract
  // This includes all FLR backing stFLR tokens: staked FLR on P-Chain, buffer reserves, and pending deposits
  const totalPooledFlr = await api.call({
    target: STFLR_CONTRACT,
    abi: 'function totalPooledFlr() view returns (uint256)',
  });

  // Add native FLR to TVL
  api.add(FLR_ADDRESS, totalPooledFlr);

  return api.getBalances();
}

module.exports = {
  flare: {
    tvl,
  },
  methodology: 'TVL is calculated by calling totalPooledFlr() on the stFLR contract, which returns the total amount of FLR backing the liquid staking tokens, including staked FLR on P-Chain, buffer reserves, and pending deposits.',
};
