const { gmxExports } = require('../helper/gmx')

module.exports = {
  base:{
    tvl: gmxExports({ vault: '0x3a384968A2fea56d0394F9B349ab8D0c839ddc04', })
  },
};