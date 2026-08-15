const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  methodology: 'TVL is the value of tokens locked in Qom X DEX liquidity pools on BSC (calculated from the factory).',
  bsc: {
    tvl: getUniTVL({
      factory: '0x356037CbC77B3A2B36E0484d96DF0De247e66785',
      useDefaultCoreAssets: true,
    })
  }
}
