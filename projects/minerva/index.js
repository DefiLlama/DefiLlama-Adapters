const {staking} = require('../helper/staking')
const { gmxExports } = require('../helper/gmx')

const arbitrumVault = '0x7EF6f8abAc00689e057C9ec14E34aC232255a2fb';
const arbitrumStaking = '0x06177a05704C8156f8b3ae9391365497C432260A';
const arbitrumGMX = '0xE4d8701C69b3B94A620ff048e4226C895b67b2c0';

module.exports = {
  fantom: {
    staking: staking(arbitrumStaking, arbitrumGMX),
    tvl: gmxExports({ vault: arbitrumVault, })
  }
}