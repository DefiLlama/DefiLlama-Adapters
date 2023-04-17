const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  eos_evm: {
    tvl: getUniTVL({ factory: '0x6E6AB9216D8B886A71F5923600Bb1c94fbb35f85', useDefaultCoreAssets: true, fetchBalances: true, })
  }
}