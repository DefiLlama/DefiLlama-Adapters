const { gmxExports } = require('../helper/gmx')

const taraxa_vault = '0xCCA1234b65FF576572E6D278aE6cacfF6989D93D';

module.exports = {
  tara: {
    tvl: gmxExports({ vault: taraxa_vault })
  }
};
