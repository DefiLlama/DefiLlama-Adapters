const { getTableRows, } = require("../helper/chain/proton");
const { get } = require('../helper/http')
const { toUSDTBalances } = require('../helper/balances');

const SWAP_CONTRACT = 'proton.swaps';

 /**
 * It gets all the pools from the pools table in the swap contract.
 * @param {string} [lower_bound] - The lower bound of the range of rows to return.
 * @returns The `getPools` function returns an array of `RawPool` objects.
 */
async function getPools (lower_bound) {
    let { rows, more, next_key } = await getTableRows({
        code: SWAP_CONTRACT,
        scope: SWAP_CONTRACT,
        table: 'pools',
        limit: -1,
        key_type: 'i64',
        lower_bound
    })

    if (more) {
        const moreRows = await this.getPools(next_key)
        rows = rows.concat(moreRows)
    }
    return rows
}

async function getTokenPrices () {
  return get("https://api.protonchain.com/v1/chain/tokens") 
}

async function poolsWithPrices () {  
    const pools = await getPools();
    const tokenPrices = await getTokenPrices();

    if (!tokenPrices) return pools
    return pools
      .map(_pool => {
        const switchUsdc = _pool.pool1.xtokenSymbol === 'XUSDC'
        const switchXpr = _pool.pool1.xtokenSymbol === 'XPR' && _pool.pool2.xtokenSymbol !== 'XUSDC'
        if (switchUsdc || switchXpr) {
          const tmp = _pool.pool1
          _pool.pool1 = _pool.pool2
          _pool.pool2 = tmp
        }
        
        _pool.pool1.xtokenContract = _pool.pool1.contract;
        _pool.pool1.xtokenSymbol = _pool.pool1.quantity.split(' ')[1];
        _pool.pool2.xtokenContract = _pool.pool2.contract;
        _pool.pool2.xtokenSymbol = _pool.pool2.quantity.split(' ')[1];

        const fromTokenPrice = tokenPrices.find((price) => price.account === _pool.pool1.xtokenContract && price.symbol === _pool.pool1.xtokenSymbol)
        const toTokenPrice = tokenPrices.find((price) => price.account === _pool.pool2.xtokenContract && price.symbol === _pool.pool2.xtokenSymbol)

        _pool.liquidityUsd = 0
        if (fromTokenPrice && toTokenPrice) {
          const _pool1_amount = _pool.pool1.quantity.split(' ')[0];
          const _pool2_amount = _pool.pool2.quantity.split(' ')[0];

          const token1Total = _pool1_amount * (fromTokenPrice.price.usd)
          const token2Total = _pool2_amount * (toTokenPrice.price.usd)
          _pool.liquidityUsd = token1Total + (token2Total)
        }
        return _pool
      })
      .sort((_pool1, _pool2) => (_pool2.liquidityUsd || 0) - (_pool1.liquidityUsd || 0))
}

async function getPoolTvl() {
  const pools = await poolsWithPrices();
  let totalLiquidityUsd = 0;
  for (const pool of pools) {
    totalLiquidityUsd += pool.liquidityUsd;
  }  
  return toUSDTBalances(totalLiquidityUsd);
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `Pool liquidity`,
  proton: {
    tvl: getPoolTvl
  }, 
}