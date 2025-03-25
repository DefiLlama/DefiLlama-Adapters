const {default: BigNumber} = require("bignumber.js")
const {post} = require("../helper/http");
const sdk = require("@defillama/sdk");
const {PromisePool} = require("@supercharge/promise-pool");

const endpoint = 'https://s1.ripple.com:51234';

async function sumTokens({ tokens = [], owners = [], balances = {} }) {
    const { errors } = await PromisePool.withConcurrency(5)
        .for(owners)
        .process(async owner => {
            await getTokenBalances(tokens, owner, { balances })
        })

    if (errors && errors.length)
        throw errors[0]

    return balances
}

async function getTokenBalances(tokens, account, { balances = {} } = {}) {
    const body =  {
        method: 'account_lines',
        params: [{ account, ledger_index: 'validated' }]
    };
    const res = await post(endpoint, body);

    const lines = res?.result?.lines;
    if (!lines) return balances;
    for (const line of lines) {
        const token = tokens.find((t) => line.currency === t.currency && line.account === t.issuer);
        if (token === undefined) continue;
        const balance = BigNumber(line.balance).toFixed(0);
        sdk.util.sumSingleBalance(balances, token.name, balance);
    }
    return balances;
}

module.exports = {
    getTokenBalances,
    sumTokens,
};
