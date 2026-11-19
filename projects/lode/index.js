const { uniV4HookOnChainExport } = require('../helper/uniswapV4')

const LODE_HOOK = '0x8f24193CC75Fc64A30a038442BcD622FF4070088'

module.exports = {
  doublecounted: true,
  methodology: 'Value locked in uni v4 pools with lode hooks, reconstructed on chain from pool tick liquidity via StateView',
  start: '2026-05-08',
  ethereum: { tvl: uniV4HookOnChainExport({ hook: LODE_HOOK }) },
}
