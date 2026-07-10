const { uniV4HookExport } = require('../helper/uniswapV4')

const ANGSTROM_HOOK_V4_ADDRESS = '0x0000000aa232009084bd71a5797d089aa4edfad4' // Sorella Labs: Angstrom Hook (v1)

module.exports = {
  methodology: 'Counts total assets deposited in Angstrom hook pools on Uniswap V4, queried via the official Uniswap V4 subgraph.',
  doublecounted: true, // liquidity sits in Uniswap V4 PoolManager and is already counted in Uniswap V4 TVL
  timetravel: false,
  ethereum: {
    tvl: uniV4HookExport({ hook: ANGSTROM_HOOK_V4_ADDRESS }),
  },
}
