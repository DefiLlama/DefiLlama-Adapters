const axios = require('axios')
const retry = require('../helper/retry')

const RPC_ENDPOINT = 'https://eos.greymass.com'

async function get_currency_balance(code, account, symbol) {
    const response = await retry(async () => await axios.default.post(`${RPC_ENDPOINT}/v1/chain/get_currency_balance`, {code, account, symbol}));
    try {
        return Number(response.data[0].split(" ")[0]);
    } catch (e) {
        return 0;
    }
}

async function get_account_tvl(account, tokens) {
    const balances = {}
    for ( const [ code, symbol, id ] of tokens ) {
      const balance = await get_currency_balance(code, account, symbol);
      balances[id] = balance
    }
    return balances;
  }

module.exports = {
    get_currency_balance,
    get_account_tvl,
}