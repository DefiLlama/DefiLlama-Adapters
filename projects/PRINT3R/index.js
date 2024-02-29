const { gmxExports } = require('../helper/gmx')

// Base
const baseVault = '0x102B73Ca761F5DFB59918f62604b54aeB2fB0b3E';

module.exports = {
  base:{
    tvl: gmxExports({ vault: baseVault, })
  },
  
};
