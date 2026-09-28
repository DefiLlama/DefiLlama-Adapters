const sdk = require('@defillama/sdk')
const { getUniTVL } = require('../helper/unknownTokens')

/**
 * SELEMAN DEX — Uniswap V2 fork on SELEMAN Chain (chainId 73571).
 * Factory: 0x5fD1138b4C75B953fbC58B154fC6D8806BAEcAaf
 * Wrapped native: WSMN 0x295a170346267e255Ad0265B7Fd1f043Ff825f7a
 *
 * ~7.6k pairs → memoryOptimization + queryBatched.
 * Pin monarca RPC only: SDK fallback (workers.dev edge) challenges clients
 * without User-Agent (ethers FetchRequest). monarca /rpc accepts them.
 */
const PUBLIC_RPC = 'https://seleman.monarcaproject.com/rpc'
try {
  const { ethers } = require('ethers')
  sdk.setProvider('seleman', new ethers.JsonRpcProvider(PUBLIC_RPC, 73571))
} catch (_) {
  /* optional */
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  methodology:
    'TVL counts tokens locked in SELEMAN DEX liquidity pools (Uniswap V2-compatible factory on SELEMAN Chain).',
  seleman: {
    tvl: getUniTVL({
      factory: '0x5fD1138b4C75B953fbC58B154fC6D8806BAEcAaf',
      useDefaultCoreAssets: true,
      queryBatched: 100,
      memoryOptimization: true,
      permitFailure: true,
      waitBetweenCalls: 150,
    }),
  },
}
