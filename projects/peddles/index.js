const { uniV4HookOnChainExport } = require('../helper/uniswapV4')

// Peddles (https://peddles.xyz): every launch is one Uniswap v4 pool carrying PeddlesFeeHook, with the
// launch liquidity locked in it. Pools are found from the PoolManager Initialize logs filtered to the hook,
// starting at the block the hook was created in, and valued on chain from tick liquidity via StateView.
// Each chain has its own hook (CREATE2 against per-chain constructor arguments), so nothing is shared.
const config = {
  base: {
    hook: '0xAB8E39207718f519865D6f0d52eFB31b231D40cc',
    fromBlock: 51855962,
  },
  robinhood: {
    hook: '0xfe055282E3cD471A8b2cd922d31E75ECd3bBc0CC',
    fromBlock: 76092920,
  },
  bsc: {
    hook: '0x39D760601731025e0F02A3e5D232445797fAC0CC',
    fromBlock: 125076797,
  },
  arc: {
    hook: '0x317e34De0298F23bd41bf9A853289e227E9cC0CC',
    fromBlock: 23687888,
    poolManager: '0x8366a39CC670B4001A1121B8F6A443A643e40951',
    stateView: '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b',
  },
}

module.exports = {
  doublecounted: true, // the pools live in the Uniswap v4 PoolManager, so Uniswap v4 TVL counts them too
  methodology: 'Counts the liquidity in every Uniswap v4 pool created by a Peddles launch, i.e. every pool that runs the Peddles fee hook. Pools are found from the PoolManager Initialize logs and their reserves are rebuilt on chain from tick liquidity and the current price. Launch liquidity is locked in these pools. Fees the hook has accrued but not yet paid out are not counted.',
  start: '2026-09-27',
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl: uniV4HookOnChainExport(config[chain]) }
})
