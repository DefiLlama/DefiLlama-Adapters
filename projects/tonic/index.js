const { call, view_account, addTokenBalances, sumSingleBalance } = require('../helper/chain/near');

const ORDERBOOK_CONTRACT = 'v1.orderbook.near';
const PERPS_CONTRACT = 'v1.tonic-perps.near';
const GET_MARKETS_METHOD = 'list_markets';
const GET_ASSETS_METHOD = 'get_assets';
const FT_NEAR = 'wrap.near';
const NATIVE_NEAR = 'near';
const RAINBOW_USDC = 'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near';
const MARKET_ACTIVE_STATE = 'Active';


async function tvl() {
    // Spot orderbook
    let listedTokensOrderbook = (await call(ORDERBOOK_CONTRACT, GET_MARKETS_METHOD, {"from_index": 0, "limit": 100}))
        .filter(market => market.state === MARKET_ACTIVE_STATE)
        .map(market => market['base_token']['token_type']['account_id'])
        .filter(token => token && token.length > 0 && token !== NATIVE_NEAR);
    listedTokensOrderbook = [...new Set(listedTokensOrderbook)];
    // Used as primary quote currency
    listedTokensOrderbook.push(RAINBOW_USDC);
    let balances = await addTokenBalances(listedTokensOrderbook, ORDERBOOK_CONTRACT);

    const orderbook_contract_state = await view_account(ORDERBOOK_CONTRACT);
    sumSingleBalance(balances, FT_NEAR, orderbook_contract_state['amount']);


    // Perps
    let listedTokensPerps = (await call(PERPS_CONTRACT, GET_ASSETS_METHOD, {}))
        .filter(asset => asset.id !== NATIVE_NEAR)
        .map(asset => asset.id);
    balances = await addTokenBalances(listedTokensPerps.filter(i => i !== 'aurora'), PERPS_CONTRACT, balances);
    const perps_contract_state = await view_account(PERPS_CONTRACT);
    sumSingleBalance(balances, FT_NEAR, perps_contract_state['amount']);
    return balances;
}


module.exports = {
  timetravel: false,
  near: {
    tvl,
  },
  methodology: 'Sum all tokens deposited into Tonic DEX'
}
