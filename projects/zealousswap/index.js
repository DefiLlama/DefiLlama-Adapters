const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology: 'Counts liquidity in all pairs from the factory contract.',
  kasplex: {
    tvl: getUniTVL({
      factory: '0x98bb580a77ee329796a79abd05c6d2f2b3d5e1bd',
      useDefaultCoreAssets: true,
    })
  }
}