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

module.exports = {
    get_currency_balance,
}