const { call, sumSingleBalance } = require('../helper/near');

const GET_STATS_METHOD = 'get_stats';
const ROKETO_STRIMING_CONTRACT = 'streaming.r-v2.near';

async function tvl() {
    let tokens = (await call(ROKETO_STRIMING_CONTRACT, GET_STATS_METHOD, {account_id: ROKETO_STRIMING_CONTRACT}))['dao_tokens']

    let balances = {};
    Object.keys(tokens).map((key) => sumSingleBalance(balances, key, tokens[key]['tvl']));

    return balances;
}

module.exports = {
  near: {
    tvl
  }
}