const { uniV4HookOnChainExport } = require('../helper/uniswapV4')

// Peddles (https://peddles.xyz): every launch is one Uniswap v4 pool carrying PeddlesFeeHook, with the
// launch liquidity locked in it. Pools are found from the PoolManager Initialize logs filtered to the hook
// and valued on chain from tick liquidity via StateView.
// Each chain has its own hook (CREATE2 against per-chain constructor arguments), so nothing is shared.
const hooks = {
  base: '0xAB8E39207718f519865D6f0d52eFB31b231D40cc',
  robinhood: '0xfe055282E3cD471A8b2cd922d31E75ECd3bBc0CC',
  bsc: '0x39D760601731025e0F02A3e5D232445797fAC0CC',
  arc: '0x317e34De0298F23bd41bf9A853289e227E9cC0CC',
}

module.exports = {
  doublecounted: true, // the pools live in the Uniswap v4 PoolManager, so Uniswap v4 TVL counts them too
  methodology: 'Counts the liquidity in every Uniswap v4 pool created by a Peddles launch, i.e. every pool that runs the Peddles fee hook. Pools are found from the PoolManager Initialize logs and their reserves are rebuilt on chain from tick liquidity and the current price. Launch liquidity is locked in these pools. Fees the hook has accrued but not yet paid out are not counted.',
  start: '2026-09-27',
}

Object.keys(hooks).forEach((chain) => {
  module.exports[chain] = { tvl: uniV4HookOnChainExport({ hook: hooks[chain] }) }
})
