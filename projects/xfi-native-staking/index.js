const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking');

// XFI Native Staking contract on CrossFi chain
const STAKING_CONTRACT = '0xBe6A45407c8479107Eb08d302420eA6eCAd890C2'; 
module.exports = {
  methodology: 'TVL consists of the XFI tokens staked in the native staking contract on CrossFi chain.',
  crossfi: {
    tvl: () => ({}), // No TVL outside of staking
    staking: staking(
      STAKING_CONTRACT, 
      ADDRESSES.crossfi.WXFI, 
      'crossfi'
    ),
  }
};
