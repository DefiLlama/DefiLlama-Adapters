const { gmxExports } = require('../helper/gmx')

const soneiumVault = '0x580DD7a2CfC523347F15557ad19f736F74D5677c'

module.exports = {
  soneium:{
    tvl: gmxExports({ vault: soneiumVault, })
  },
};
