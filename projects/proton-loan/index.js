const { get_table_rows, get_currency_balance, getAllOracleData } = require("../helper/proton");

const LENDING_CONTRACT = 'lending.loan';

async function getAllMarkets(lower_bound) {
  try {
    let { rows, more, next_key } = await get_table_rows({
      code: LENDING_CONTRACT,
      scope: LENDING_CONTRACT,
      table: 'markets',
      limit: -1,
      lower_bound: lower_bound,
    });

    if (more) {
      rows = rows.concat(await getAllMarkets(next_key));
    }

    return rows;
  } catch (e) {
    return [];
  }
}

function getLendingTvl(returnBorrowed = false) {
  return async () => {
    const oracles = await getAllOracleData();
    const markets = await getAllMarkets();
  
    let available = 0;
    let borrowed = 0;
    let tvl = 0;
  
    for (const market of markets) {
      // Find oracle
      const oracle = oracles.find(
        (oracle) => oracle.feed_index === market.oracle_feed_index
      );
      if (!oracle || !oracle.aggregate.d_double) continue;
  
      // Determine pool amount
      const [, symbol] = market.underlying_symbol.sym.split(',');
      const [cash] = await get_currency_balance(
        market.underlying_symbol.contract,
        LENDING_CONTRACT,
        symbol
      );
      const [cashAmount] = cash.split(' ');
      const [borrowAmount] = market.total_variable_borrows.quantity.split(' ');
      const total = +cashAmount + +borrowAmount;
  
      available += +cashAmount * oracle.aggregate.d_double;
      borrowed += +borrowAmount * oracle.aggregate.d_double;
      tvl += total * oracle.aggregate.d_double;
    }
  
    if (returnBorrowed) {
      return borrowed
    } else {
      return tvl
    }
  }
};

module.exports = {
  methodology: `ProtonLoan TVL is sum of all lending deposits in Proton Loan smart contract.`,
  proton: {
    tvl: getLendingTvl(false),
    borrowed: getLendingTvl(true)
  },
  fetch: getLendingTvl(false)
}