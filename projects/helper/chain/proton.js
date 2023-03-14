const { get, post, } = require('../http')
const CHAIN_RPC = 'https://proton.eoscafeblock.com';
const SWAP_CONTRACT = 'proton.swaps';
const ORACLES_CONTRACT = 'oracles';

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
  try {
    const data = await post(
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


async function getFullTable ({
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
  try {
    const data = await post(
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
    return await getFullTable({
      code: ORACLES_CONTRACT,
      scope: ORACLES_CONTRACT,
      table: 'data',
      limit: -1,
      lower_bound: lower_bound,
    });
  } catch (e) {
    return [];
  }
}

async function getAllSwapPools(lower_bound) {
  try {
    return await getFullTable({
      code: SWAP_CONTRACT,
      scope: SWAP_CONTRACT,
      table: 'pools',
      limit: -1,
      lower_bound: lower_bound,
    });
  } catch (e) {
    return [];
  }
}

async function getTokenPriceUsd(tokenSymbol, tokenContract) {
  const tokens = await get('https://api.protonchain.com/v1/chain/exchange-rates/info')
  const token = tokens.find(token => token.symbol === tokenSymbol && token.contract === tokenContract)
  const exchangeRate = token.rates.find(rate => rate.counterCurrency === 'USD')
  return exchangeRate.price
}

module.exports = {
  getTableRows,
  getCurrencyBalance,
  getAllOracleData,
  getAllSwapPools,
  getTokenPriceUsd
}