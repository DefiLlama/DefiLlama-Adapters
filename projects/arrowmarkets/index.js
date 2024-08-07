const { staking } = require('../helper/staking');
const { pool2 } = require('../helper/pool2');
const sdk = require('@defillama/sdk');
const abi = require('./abi.json');

const chain = 'avax';  // specify the chain as Avalanche

// If your project has staking on Avalanche
const stakingContractAddress = '0x9193957DC6d298a83afdA45A83C24c6C397b135f';
const stakingTokenAddress = '0x5c5e384Bd4e36724B2562cCAA582aFd125277C9B';


// If your project has liquidity pools (pool2) on Avalanche
const pool2LPs = [
  '0xc3311F358AFaD52e13425d41053F6fdCaf0DE6dB',
];

module.exports = {
    methodology: `TVL is calculated by fetching the total staked amount from the staking contract and the value of tokens in the liquidity pools.`,
    [chain]: {
      tvl: async (api) => {
        // Fetch the total staked amount
        const totalStaked = await getTotalStakedAmount(api);
  
        // Add the staked tokens to the TVL
        api.add(stakingTokenAddress, totalStaked);
  
        // Add other TVL calculations if necessary
        // Example: You can add liquidity pool TVL calculations here
  
        return api.getBalances();
      },
    },
  };
  
  async function getTotalStakedAmount(api) {
    const { output: totalStaked } = await sdk.api.abi.call({
      target: stakingContractAddress,
      abi: abi.stakingContract.totalStakeAmounts,
      chain: chain,
    });
  
    return totalStaked;
  }
