const { staking } = require('../helper/staking');

const PHANDS_TOKEN = '0x11157da1fc6dcfd58b50ed79082183b2c6176245';
const STAKING_CONTRACT = '0x0f4e761F2DcFD509eccd18004b89e329D25903B7';

module.exports = {
  methodology: 'TVL includes the total volume of PHANDS tokens locked in the official staking smart contract.',
  ethereum: {
    tvl: () => ({}), 
    staking: staking(STAKING_CONTRACT, PHANDS_TOKEN) 
  }
};
