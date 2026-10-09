const { uniV4HookOnChainExport } = require('../helper/uniswapV4')

const ANGSTROM_HOOK_V4_ADDRESS = '0x0000000aa232009084bd71a5797d089aa4edfad4' // Sorella Labs: Angstrom Hook (v1)

module.exports = {
  methodology: 'Counts the liquidity in every Uniswap V4 pool that runs the Angstrom hook, plus fees held by the hook contract. Pools are discovered from the PoolManager Initialize logs and their reserves are reconstructed on chain from tick liquidity and the current price via the V4 StateView contract.',
  doublecounted: true, // liquidity sits in Uniswap V4 PoolManager and is already counted in Uniswap V4 TVL
  timetravel: false,
  ethereum: {
    tvl: uniV4HookOnChainExport({ hook: ANGSTROM_HOOK_V4_ADDRESS, includeHookBalances: true }),
  },
}
