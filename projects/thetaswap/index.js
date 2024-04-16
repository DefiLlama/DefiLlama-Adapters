const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0xe8b97478ae8ab1fcfd46cdb2f62869ec63bbf69f) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  theta: {
    tvl: getUniTVL({ factory: '0xe8b97478ae8ab1fcfd46cdb2f62869ec63bbf69f', useDefaultCoreAssets: true }),
  },
}
