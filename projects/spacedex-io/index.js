const {staking} = require('../helper/staking')
const { gmxExports } = require('../helper/gmx')

//Arbitrum
const arbitrumVault = '0xA2D4719b29991271F3a6f06C757Ce31C6731491E'
const arbitrumStaking = '0xdb3aE24F01E8a0AF40CEd355B7262BbdbFdF715A'
const arbitrumFalcon = '0xA822CfD3AcbC0eB1a1Aba073B3355aCaF756ef7F'

//Bsc
const bscVault = '0x24Ed2bf2c1E76C621164d93B73debD10cdC4BBD0'
const bscStaking = '0x7B8f0a523E8B929EB854749096e1b032189e0f26'
const bscFalcon = '0x37D39950f9C753d62529DbF68fCb4DCa4004fBFd'

module.exports = {
  arbitrum: {
    staking: staking(arbitrumStaking, arbitrumFalcon, "arbitrum", "falcon", 18),
    tvl: gmxExports({ vault: arbitrumVault, })
  },
  bsc:{
    staking: staking(bscStaking, bscFalcon, "bsc", "falcon", 18),
    tvl: gmxExports({ vault: bscVault, })
  },
  hallmarks:[
      ['2023-03-09', "BSC SpaceDex Launch"],
      ['2023-04-03', "Arbitrum SpaceDex Launch"]
  ],
  
};
