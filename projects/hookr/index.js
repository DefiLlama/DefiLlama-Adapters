const { addUniV4PoolReserves, chainConfig } = require('../helper/uniswapV4');
const { discoverPools } = require('./pools');

async function tvl(api) {
  const pools = await discoverPools(api);
  // Reconstruct principal across every LP range, including third-party positions.
  // Do not add vault/NFT balances again: their underlying liquidity is already here.
  await addUniV4PoolReserves({ api, pools, stateView: chainConfig[api.chain].stateView });
}

module.exports = {
  start: '2026-08-04', // First canonical Graduated event: Robinhood block 27767017.
  doublecounted: true, // These ranges are also included in Uniswap V4 TVL.
  methodology:
    'Counts both assets of all liquidity ranges in authenticated current, modular and legacy Hookr ' +
    'Uniswap V4 pools, including third-party LP positions. Pool principal overlaps with Uniswap V4 TVL. ' +
    'Excludes accrued fees, pre-pool curves and auctions, outside-pool tokenizer backing, and protocol ' +
    'treasury or burn-jar balances. Vault and position receipt tokens are not counted again.',
  robinhood: { tvl },
};
