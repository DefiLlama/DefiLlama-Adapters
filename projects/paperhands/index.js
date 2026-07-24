const { staking } = require('../helper/staking');

const PHANDS_TOKEN = '0x11157da1fc6dcfd58b50ed79082183b2c6176245';
const STAKING_CONTRACT = '0x62fe22a9b954bc84fc6a74d889324fb40d13dce4';

module.exports = {
  methodology: 'TVL includes the total volume of PHANDS tokens locked in the official staking smart contract.',
  ethereum: {
    tvl: () => ({}), 
    staking: staking(STAKING_CONTRACT, PHANDS_TOKEN) 
  }
};
