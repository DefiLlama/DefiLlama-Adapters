const sdk = require('@defillama/sdk');
const abi = require('./abi.json');

// Contract addresses on Monad testnet
const MAGMA_ADDRESS = '0x8498312A6B3CbD158bf0c93AbdCF29E6e4F55081';
const STAKING_PRECOMPILE = '0x0000000000000000000000000000000000001000';

/**
 * Get TVL for Magma Protocol by querying validators and their delegations
 * @param {*} api - DefiLlama SDK API object
 * @returns {Object} - Balances object with MON TVL
 */
async function tvl(api) {
  // Get CoreVault and GVault addresses from Magma
  const [coreVaultAddress, gVaultAddress] = await Promise.all([
    api.call({
      target: MAGMA_ADDRESS,
      abi: abi.coreVault,
    }),
    api.call({
      target: MAGMA_ADDRESS,
      abi: abi.gVault,
    }),
  ]);

  // Get validators from both vaults
  const [coreValidators, gValidators] = await Promise.all([
    api.call({
      target: coreVaultAddress,
      abi: abi.getValidators,
    }),
    api.call({
      target: gVaultAddress,
      abi: abi.getValidators,
    }),
  ]);

  // Calculate TVL for CoreVault
  let totalTvl = 0n;

  // Process CoreVault validators
  for (const validatorId of coreValidators) {
    try {
      const delegatorInfo = await api.call({
        target: STAKING_PRECOMPILE,
        abi: abi.getDelegator,
        params: [validatorId, coreVaultAddress],
      });

      // delegatorInfo returns: [stake, accRewardPerToken, unclaimedRewards, deltaStake, nextDeltaStake, deltaEpoch, nextDeltaEpoch]
      const [stake, , unclaimedRewards, deltaStake, nextDeltaStake] = delegatorInfo;
      
      // Sum: active stake + pending stake + next pending stake + unclaimed rewards
      totalTvl += BigInt(stake) + BigInt(deltaStake) + BigInt(nextDeltaStake) + BigInt(unclaimedRewards);
    } catch (e) {
      // Skip validators that fail (might be removed or invalid)
      console.error(`Error querying CoreVault validator ${validatorId}:`, e.message);
    }
  }

  // Process GVault validators
  for (const validatorId of gValidators) {
    try {
      const delegatorInfo = await api.call({
        target: STAKING_PRECOMPILE,
        abi: abi.getDelegator,
        params: [validatorId, gVaultAddress],
      });

      const [stake, , unclaimedRewards, deltaStake, nextDeltaStake] = delegatorInfo;
      
      // Sum: active stake + pending stake + next pending stake + unclaimed rewards
      totalTvl += BigInt(stake) + BigInt(deltaStake) + BigInt(nextDeltaStake) + BigInt(unclaimedRewards);
    } catch (e) {
      // Skip validators that fail (might be removed or invalid)
      console.error(`Error querying GVault validator ${validatorId}:`, e.message);
    }
  }

  // Add balance to the api balances object
  // For native tokens on EVM chains, use the null address  
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  api.add(ZERO_ADDRESS, totalTvl);
}

module.exports = {
  timetravel: false,
  methodology: 'Calculates TVL by summing all validator delegations (active stake + pending stake + next pending stake + unclaimed rewards) from both CoreVault and GVault through the Monad staking precompile',
  monad: {
    tvl,
  },
};

