const { gmxExports } = require('../helper/gmx')

module.exports = {
  polygon_zkevm:{
    tvl: gmxExports({ vault: '0x99b31498b0a1dae01fc3433e3cb60f095340935c', })
  },
};
