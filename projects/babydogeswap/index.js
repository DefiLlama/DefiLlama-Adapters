const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

const farmFactoryContract = '0x4693B62E5fc9c0a45F89D62e6300a03C85f43137'
const babydogeTokenAddress = '0xc748673057861a797275CD8A068AbB95A902e8de'
const stakingContract = '0xcecd3e7eadae1ad0c94f53bf6a2af188df1a90d0'

module.exports = {
  methodology: 'Total TVL in all farms and BabyDoge staking pool',
  misrepresentedTokens: true,
  bsc: {
    staking: staking(stakingContract, babydogeTokenAddress),
    tvl: getUniTVL({ 
      useDefaultCoreAssets: true, 
      factory: farmFactoryContract,
      blacklistedTokens: [
        '0xe320df552e78d57e95cf1182b6960746d5016561'
      ]
    })
  },
}
