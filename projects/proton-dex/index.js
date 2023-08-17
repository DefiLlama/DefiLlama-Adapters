const { getTableRows, getCurrencyBalance, getAllOracleData, getTokenPriceUsd } = require("../helper/chain/proton");
const { get } = require('../helper/http')
const { toUSDTBalances } = require('../helper/balances');

const DEX_CONTRACT = 'dex';

 /**
 * It gets all the pools from the pools table in the swap contract.
 * @param {string} [lower_bound] - The lower bound of the range of rows to return.
 * @returns The `getPools` function returns an array of `RawPool` objects.
 */
async function getMarkets (lower_bound) {
    let { rows, more, next_key } = await getTableRows({
        code: DEX_CONTRACT,
        scope: DEX_CONTRACT,
        table: 'markets',
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

async function marketsWithPrices () {  
    const oracles = await getAllOracleData();
    const markets = await getMarkets();
    const tokenPrices = await getTokenPrices();

    let tvl = 0;
    const marketSet = new Set();

    for (const market of markets) {  
      // Find oracle
      const oracle = oracles.find(
        (oracle) => oracle.feed_index === market.ask_oracle_index
      );
      if (!oracle || !oracle.aggregate.d_double) continue;
  
      // Determine pool amount
      const [, symbol] = market.bid_token.sym.split(',');

      if (!marketSet.has(symbol)){

          marketSet.add(symbol);

          const [cash] = await getCurrencyBalance(
          market.bid_token.contract,
          DEX_CONTRACT,
          symbol
        );
        
        const tokenPrice = tokenPrices.find((price) => price.account === market.bid_token.contract && price.symbol === symbol).price.usd;

        const [cashAmount] = cash.split(' ');
        const total = +cashAmount * tokenPrice;
        tvl += total * oracle.aggregate.d_double;
      }
    }
    return tvl;
}

async function getDexTvl() {
  const tvl = await marketsWithPrices();
  return toUSDTBalances(tvl);
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `Proton Dex TVL is the sum of pool liquidity on the DEX`,
  proton: {
    tvl: getDexTvl
  }, 
}