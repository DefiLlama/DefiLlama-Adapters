const {staking} = require('../helper/staking')
const { gmxExports } = require('../helper/gmx')

const arbitrumVault = '0x0e0B4Af82D0B549c1584D0EF5d4eEf675C5e7E9F';
const arbitrumStaking = '0x55f8071d1373a2345bFbAaA6c2FEcc081f919AD8';
const arbitrumGMX = '0x9945Dd3eCB40A6b594813f2A4DF1643b10Fe3550';

module.exports = {
  fantom: {
    staking: staking(arbitrumStaking, arbitrumGMX, "fantom", "cranium", 18),
    tvl: gmxExports({ vault: arbitrumVault, })
  }
};
