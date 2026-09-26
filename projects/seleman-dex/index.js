const { getUniTVL } = require('../helper/unknownTokens')

/**
 * SELEMAN DEX — Uniswap V2 fork on SELEMAN Chain (chainId 73571).
 * Factory: 0x5fD1138b4C75B953fbC58B154fC6D8806BAEcAaf
 * Wrapped native: WSMN 0x295a170346267e255Ad0265B7Fd1f043Ff825f7a
 */
module.exports = {
  misrepresentedTokens: true,
  methodology:
    'TVL counts tokens locked in SELEMAN DEX liquidity pools (Uniswap V2-compatible factory on SELEMAN Chain).',
  seleman: {
    tvl: getUniTVL({
      factory: '0x5fD1138b4C75B953fbC58B154fC6D8806BAEcAaf',
      useDefaultCoreAssets: true,
    }),
  },
}
