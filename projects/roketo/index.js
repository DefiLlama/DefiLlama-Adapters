const { call, sumSingleBalance } = require('../helper/chain/near');

const GET_STATS_METHOD = 'get_stats';
const ROKETO_STRIMING_CONTRACT = 'streaming.r-v2.near';

const stableTokens = [
  'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near', // USDC
  '6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near', // DAI
  'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near', // USDT
  'wrap.near',
  'usn',
]

async function getTokenData() {
  return (await call(ROKETO_STRIMING_CONTRACT, GET_STATS_METHOD, {account_id: ROKETO_STRIMING_CONTRACT}))['dao_tokens']
}

async function tvl() {
    let balances = {};
    const tokens = await getTokenData()
    Object.keys(tokens)
      .filter(token => stableTokens.includes(token))
      .map((key) => sumSingleBalance(balances, key, tokens[key]['tvl']));
    return balances;
}

async function vesting() {
    let balances = {};
    const tokens = await getTokenData()
    Object.keys(tokens)
      .filter(token => !stableTokens.includes(token))
      .map((key) => sumSingleBalance(balances, key, tokens[key]['tvl']));
    return balances;
}


module.exports = {
  timetravel: false,
  near: {
    tvl,
    vesting,
  }
}