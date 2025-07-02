const { staking } = require('../helper/staking');

const TREASURY = [
  '0xdE70B8BC5215BdF03f839BB8cD0F639D4E3E2881',
  '0xA205fD6A798A9Ba8b107A00b8A6a5Af742d6aCb5',
  '0x990eCdf73704f9114Ee28710D171132b5Cfdc6f0',
  '0xa653879692D4D0e6b6E0847ceDd58eAD2F1CC136'
]


const CONTRACTS = [
  '0xf4aa59f5192856f41ae19caab4929ccd3a265e70', // staked 
  '0x7519461fbd96abb539c770d57f38c2e91f8262aa',
  '0xd7e31990883250e53314b15ee555345f04d011e8',
  '0x87412c03979cc19c60071f5f98313a7cbe9f6d65', // rewards 

];

const WLTH = '0x99b2B1A2aDB02B38222ADcD057783D7e5D1FCC7D';

module.exports = {
  base: {
    tvl: () => ({}),
    staking: staking(CONTRACTS, WLTH)
  }
};
