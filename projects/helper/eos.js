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

// native staked CPU/Net & REX should be counted as liquid balance
async function get_staked( account_name, precision = 4 ) {
    const response = await retry(async () => await axios.default.post(`${RPC_ENDPOINT}/v1/chain/get_account`, { account_name }));
    try {
        return response.data.voter_info.staked / (10 ** precision)
    } catch (e) {
        return 0;
    }
}

async function get_account_tvl(accounts, tokens) {
    const balances = {}

    // support single or multiple accounts
    for ( const account of Array.isArray(accounts) ? accounts : [ accounts ] ) {
        for ( const [ code, symbol, id ] of tokens ) {
            const balance = await get_currency_balance(code, account, symbol);

            // support native staking as balance
            const staked = code == "eosio.token" ? await get_staked( account ) : 0;

            // support adding same balance from multiple accounts
            if ( balances[id] ) balances[id] += balance + staked;
            else balances[id] = balance + staked;
        }
    }
    return balances;
}

module.exports = {
    get_staked,
    get_currency_balance,
    get_account_tvl,
}