const {staking} = require('../helper/staking')
const { gmxExports } = require('../helper/gmx')

//Cronos
const phoenixVaultAddress = '0x976156BE19D35ac616c67737258EEc973202E6D6';
const phoenixStakingAddress = '0x48f206bED002fae4EcB522Dfe36e5A10F15e9f47';
const phoenixAlpAddress = '0x6c6647B3E6AfA27B8Fb9BEDe728A3603eB6c0fC7';

module.exports = {
  lightlink_phoenix: {
    staking: staking(phoenixStakingAddress, phoenixAlpAddress),
    tvl: gmxExports({ vault: phoenixVaultAddress, })
  },
};
