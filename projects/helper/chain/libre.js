const { get, post, } = require('../http')
const CHAIN_RPC = 'https://lb.libre.org';
const API_URL = 'https://dashboard-api.libre.org';

async function getTableRows({
  json = true,
  code,
  scope,
  table,
  lower_bound = '',
  upper_bound = '',
  index_position = 1,
  key_type = '',
  limit = -1,
  reverse = false,
  show_payer = false,
}) {
  const data = await post(
    `${CHAIN_RPC}/v1/chain/get_table_rows`,
    {
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
    }
  );
  return data;
}

async function getFullTable({
  code,
  scope,
  table,
  lower_bound,
  upper_bound,
}) {
  let { rows, more, next_key } = await getTableRows({
    code,
    scope,
    table,
    lower_bound,
    upper_bound,
    limit: -1
  })

  if (more) {
    rows = rows.concat(await getFullTable({
      code,
      scope,
      table,
      lower_bound: next_key,
      upper_bound
    }))
  }

  return rows
}

async function getCurrencyBalance(code, account, symbol) {
  const data = await post(
    CHAIN_RPC + '/v1/chain/get_currency_balance',
    JSON.stringify({
      code,
      account,
      symbol
    })
  );
  return data;
}

async function getExchangeRates() {
  return get(`${API_URL}/exchange-rates`);
}

async function getTokenUSDPrice(tokenSymbol) {
  tokenSymbol = tokenSymbol.toUpperCase();
  const tokens = getExchangeRates();
  return tokens[tokenSymbol];
}

module.exports = {
  getTableRows,
  getFullTable,
  getTokenUSDPrice,
  getExchangeRates,
  getCurrencyBalance,
}