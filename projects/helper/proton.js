const axios = require('axios');

const CHAIN_RPC = 'https://proton.greymass.com';

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

module.exports = {
  get_table_rows,
  get_currency_balance,
  getAllOracleData,
}