const { staking } = require('../helper/staking')
const SNSY_TOKEN_CONTRACT = '0x82a605D6D9114F4Ad6D5Ee461027477EeED31E34';
const SNSY_CLUB_STAKING_CONTRACT = '0x382c70620e42c2EF2b303b97bad1d9439Bf48ef9';

module.exports = {
  methodology: 'Counts the number of SNSY tokens in the Staking contract.',
  ethereum: {
    tvl: () => ({}),
    staking: staking(SNSY_CLUB_STAKING_CONTRACT, SNSY_TOKEN_CONTRACT)
  }
}; 