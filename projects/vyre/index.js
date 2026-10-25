const { uniV3Export } = require('../helper/uniswapV3')

const FACTORY = '0xdB209972c8E49d55774b65380fBd27547bF13f1E'

const v3Tvl = uniV3Export({
    vyre: {
          factory: FACTORY,
          fromBlock: 1,
          eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool, address quoteToken, uint24 buyFee, uint24 sellFee, uint24 platformFee, address liquidityManager)',
    },
}).vyre.tvl

module.exports = {
    methodology: 'TVL is the ERC-20 balances held by VYRE launchpad concentrated-liquidity pools (a modified Uniswap v3 fork). Pools are discovered from PoolCreated events on the VyrePoolFactory contract; the fee customizations (buy/sell/platform/launch fees) only change swap pricing, not how reserves are stored or read.',
    start: '2026-10-24',
    vyre: { tvl: v3Tvl },
}
