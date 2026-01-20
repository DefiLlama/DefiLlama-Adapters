const { gmxExports } = require('../helper/gmx')
const sdk = require('@defillama/sdk')

const soneiumVault = '0x580DD7a2CfC523347F15557ad19f736F74D5677c'
const soneiumVault2 = '0xcAC4469f2565f30fA17998A69A32203A44c29D88'

module.exports = {
  soneium:{
    tvl: sdk.util.sumChainTvls([
      gmxExports({ vault: soneiumVault, }),
      gmxExports({ vault: soneiumVault2, })
    ])
  },
};
