const { getFullTable , getExchangeRates } = require("../helper/chain/libre");
const { toUSDTBalances } = require('../helper/balances');

const SWAP_CONTRACT = 'swap.libre';

async function getPoolScopes() {
    const pools = await getFullTable({code: SWAP_CONTRACT, scope: SWAP_CONTRACT, table: `swapindex`});
    const result = [];
    for (const pool of pools) {
        result.push(pool['swap_symbpol'].split(',')[1]);
    }
    return result;
}

async function getPoolStats(scope, exchangeRates) {
    const stats = await getFullTable({code: SWAP_CONTRACT, scope, table: `stat`});
    if (stats && stats.length) {
        const poolStats = stats[0];
        const pool1Quantity = poolStats.pool1.quantity;
        const pool2Quantity = poolStats.pool2.quantity;
        const [ pool1Amount, pool1Symbol ] = pool1Quantity.split(' ');
        const [ pool2Amount, pool2Symbol ] = pool2Quantity.split(' ');
        const pool1Rate = exchangeRates[pool1Symbol.toUpperCase()] ?? 0;
        const pool2Rate = exchangeRates[pool2Symbol.toUpperCase()] ?? 0;
        return parseFloat(pool1Amount) * parseFloat(pool1Rate) 
            +  parseFloat(pool2Amount) * parseFloat(pool2Rate);
    }
    return 0;
}

async function getTvl() {
    let result = 0;
    const [exchangeRates, scopes ] = await Promise.all([
      getExchangeRates(),
      getPoolScopes(),
    ])
    await Promise.all(scopes.map(async scope => {
      const poolTvl = await getPoolStats(scope, exchangeRates);
      result += poolTvl;
    }))
    return toUSDTBalances(result);
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  methodology: `Total Pool Liquidity on Libre Swap`,
  libre: {
    tvl: getTvl,
  }, 
}