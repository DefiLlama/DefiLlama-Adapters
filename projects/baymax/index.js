const {staking} = require('../helper/staking')
const { gmxExports } = require('../helper/gmx')


//Avalanche
const avalancheVault = '0x6De10cA248723Ea0B8c2dC72920C3B2bB417dAb4'
const avalancheStaking = '0x42526FaAf9400c08DA7CE713388eed29273d65dE'
const avalancheBAY = '0x18706c65b12595EDB43643214EacDb4F618DD166'

module.exports = {
  avax:{
    staking: staking(avalancheStaking, avalancheBAY),
    tvl: gmxExports({ vault: avalancheVault, })
  }
};
