const { getUniTVL } = require('../helper/unknownTokens')
const chains = ['kava']

module.exports = {
  misrepresentedTokens: true,
  methodology: "Use Direct Exchange factory contract to get liquidity pools and token balances.",
};

chains.forEach(chain => {
  module.exports[chain] = {
    tvl: getUniTVL({ 
      factory: '0xcE08c3d20Ff00a9Cf0D28922768bD606592B5D4C',
      useDefaultCoreAssets: true
    })
  }
})