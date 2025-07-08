const {staking} = require('../helper/staking')
const { gmxExports } = require('../helper/gmx')

//Cronos
const cronosVault = '0x26e5FbFbfd38a27D5777C9C9CC5543e687E637D8';
const cronosStaking = '0xbCCE1c2efDED06ee73183f8B20f03e452EF8495D';
const cronosBLU = '0x1542bA4CA0fb6D1B4476a933B292002fd1959A52';
//Polygon
const polygonVault = '0xd6f70237f501891C3E1634544F36E026250c2D3F'
const polygonStaking = '0xb710f0D97023340eB3faBC4259FEAdf3bBeDdf05'
const polygonBLU = '0x759d34685468604c695De301ad11A9418e2f1038'

module.exports = {
  cronos: {
    staking: staking(cronosStaking, cronosBLU),
    tvl: gmxExports({ vault: cronosVault, })
  },
  polygon:{
    staking: staking(polygonStaking, polygonBLU),
    tvl: gmxExports({ vault: polygonVault, })
  }
};
