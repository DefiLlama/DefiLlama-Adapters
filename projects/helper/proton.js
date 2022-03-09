const axios = require('axios');

const CHAIN_RPC = 'https://proton.greymass.com';

const LENDING_CONTRACT = 'lending.loan';

async function get_table_rows({
  json = true,
  code,
  scope,
  table,
  lower_bound = '',
  upper_bound = '',
  index_position = 1,
  key_type = '',
  limit = 10,
  reverse = false,
  show_payer = false,
}) {
  try {
    const { data } = await axios.default.post(
      CHAIN_RPC + '/v1/chain/get_table_rows',
      JSON.stringify({
        json,
        code,
        scope,
        table,
        lower_bound,
        upper_bound,
        index_position,
        key_type,
        limit,
        reverse,
        show_payer,
      })
    );
    return data;
  } catch (e) {
    console.error(e);
  }
}

async function get_currency_balance(code, account, symbol) {
  try {
    const { data } = await axios.default.post(
      CHAIN_RPC + '/v1/chain/get_currency_balance',
      JSON.stringify({
        code,
        account,
        symbol
      })
    );
    return data;
  } catch (e) {
    console.error(e);
  }
}

async function getAllOracleData(lower_bound) {
  try {
    let { rows, more, next_key } = await get_table_rows({
      code: 'oracles',
      scope: 'oracles',
      table: 'data',
      limit: -1,
      lower_bound: lower_bound,
    });

    if (more) {
      rows = rows.concat(await getAllOracleData(next_key));
    }

    return rows;
  } catch (e) {
    return [];
  }
}

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

async function get_account_tvl() {
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
  return tvl;
};

module.exports = {
  get_account_tvl
}