const sdk = require('@defillama/sdk');
const { staking } = require('../helper/staking');

const stakingContract = '0x51e025cb3ee0b99a84f7fb80994198281e29aa3e';
const stakedToken = '0xeff2A458E464b07088bDB441C21A42AB4b61e07E';

module.exports = {
  methodology: 'TVL of ParagonsDAO corresponds to the staking of PDT tokens in the staking contract.',
  start: 18751707, // Update with the block or timestamp when staking started
  base: {
    tvl: async () => ({}), // leave protocol TVL as empty
    staking: staking(stakingContract, stakedToken),
  },
};
