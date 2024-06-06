const { post } = require('../http')

const RPC_ENDPOINTS = {
    'eos': 'https://eos.greymass.com',
    'wax': 'https://wax.greymass.com',
    'telos': 'https://telos.greymass.com',
}

async function getEosBalance(account_name, chain = "eos") {
    return post(`${RPC_ENDPOINTS[chain]}/v1/chain/get_account`, { account_name, })
}

async function get_currency_balance(code, account, symbol, chain = "eos") {
    const data = await post(`${RPC_ENDPOINTS[chain]}/v1/chain/get_currency_balance`, { code, account, symbol })
    if (!data.length) return 0
    return Number(data[0].split(" ")[0]);
}

/**
 * Get symbol precision
 *
 * @example
 *
 * get_precision("EOS");
 * // => 4
 * get_precision("4,EOS");
 * // => 4
 * get_precision("8,WAX");
 * // => 8
 */
function get_precision(symbol) {
    if (symbol.includes(",")) return symbol.split(",")[0];
    if (symbol == "EOS") return 4;
    if (symbol == "TLOS") return 4;
    if (symbol == "WAX") return 8;
    return 4;
}

// native staked CPU/Net & REX should be counted as liquid balance
async function get_staked(account_name, symbol, chain = "eos") {
    const response = await post(`${RPC_ENDPOINTS[chain]}/v1/chain/get_account`, { account_name })
    try {
        return response.voter_info.staked / (10 ** get_precision(symbol))
    } catch (e) {
        return 0;
    }
}

async function get_account_tvl(accounts, tokens, chain = "eos") {
    const balances = {}

    // support single or multiple accounts
    for (const account of Array.isArray(accounts) ? accounts : [accounts]) {
        for (const [code, symbol, id] of tokens) {
            const balance = await get_currency_balance(code, account, symbol, chain);

            // support native staking as balance
            const staked = code == "eosio.token" ? await get_staked(account, symbol, chain) : 0;

            // support adding same balance from multiple accounts
            if (balances[id]) balances[id] += balance + staked;
            else balances[id] = balance + staked;
        }
    }
    return balances;
}

module.exports = {
    getEosBalance,
    get_staked,
    get_currency_balance,
    get_account_tvl,
}