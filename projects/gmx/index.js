const {staking} = require('../helper/staking')
const { gmxExports } = require('../helper/gmx')

//Arbitrum
// const arbitrumApiEndpoint = 'https://gmx-server-mainnet.uw.r.appspot.com/tokens'
const arbitrumVault = '0x489ee077994B6658eAfA855C308275EAd8097C4A';
const arbitrumStaking = '0x908C4D94D34924765f1eDc22A1DD098397c59dD4';
const arbitrumGMX = '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a';
//Avalanche
// const avalancheApiEndpoint = 'https://gmx-avax-server.uc.r.appspot.com/tokens'
const avalancheVault = '0x9ab2De34A33fB459b538c43f251eB825645e8595'
const avalancheStaking = '0x2bD10f8E93B3669b6d42E74eEedC65dd1B0a1342'
const avalancheGMX = '0x62edc0692BD897D2295872a9FFCac5425011c661'

module.exports = {
  arbitrum: {
    staking: staking(arbitrumStaking, arbitrumGMX, "arbitrum", "gmx", 18),
    tvl: gmxExports({ chain: 'arbitrum', vault: arbitrumVault, })
  },
  avax:{
    staking: staking(avalancheStaking, avalancheGMX, "avax", "gmx", 18),
    tvl: gmxExports({ chain: 'avax', vault: avalancheVault, })
  }
};
