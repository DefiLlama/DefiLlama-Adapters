const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: getUniTVL({
      chain: 'ethereum',
      useDefaultCoreAssets: true,
      factory: '0x460b2005b3318982feADA99f7ebF13e1D6f6eFfE',
    })
  }
};

/* // const { staking } = require('../helper/staking')
const factory = '0x460b2005b3318982feADA99f7ebF13e1D6f6eFfE'
// const copeToken = '0x56b251d4b493ee3956e3f899d36b7290902d2326'
// const masterChef = '0xa73Ae666CEB460D5E884a20fb30DE2909604557A'

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL accounts for the liquidity on all AMM pools, staking accounts for tvl staked in masterChef (soon) (0x2D40571302e89F41b4ae172d7fc9B12C1F45D0F9)',
  ethereum: {
  // staking: staking(masterChef, copeToken, 'ethereum'),
    tvl: getUniTVL({
      factory,
      useDefaultCoreAssets: false,
    }),
  },
} */