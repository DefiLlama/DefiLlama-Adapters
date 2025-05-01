const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { staking } = require('../helper/staking');

// XFI Native Staking contract on CrossFi chain
const STAKING_CONTRACT = '0xBe6A45407c8479107Eb08d302420eA6eCAd890C2'; 
const XFI_TOKEN = ADDRESSES.crossfi.WXFI; // Native XFI/WXFI token

// Custom implementation to handle staking directly
async function stakingTvl(timestamp, block, chainBlocks, { api }) {
  try {
    // Get the XFI balance in the staking contract
    const balance = await sdk.api.eth.getBalance({
      target: STAKING_CONTRACT,
      chain: 'crossfi',
      block: chainBlocks['crossfi']
    });
    
    console.log(`Raw staking balance: ${balance.output}`);
    
    const balances = {};
    // Add the balance to WXFI (wrapped XFI) which is how native tokens are tracked
    sdk.util.sumSingleBalance(balances, `crossfi:${XFI_TOKEN}`, balance.output);
    
    return balances;
  } catch (error) {
    console.error(`Error fetching staking balance: ${error.message}`);
    return {};
  }
}

module.exports = {
  methodology: 'TVL consists of the XFI tokens staked in the native staking contract on CrossFi chain.',
  crossfi: {
    tvl: () => ({}), // No TVL outside of staking
    staking: stakingTvl,
    // Uncomment this if the custom function doesn't work
    // staking: staking(STAKING_CONTRACT, XFI_TOKEN, 'crossfi'),
  }
};
