const { call, view_account, addTokenBalances, sumSingleBalance } = require('../helper/chain/near');

const SPOT_PROJECT_CONTRACT = 'spot.spin-fi.near';
const GET_CURRENCIES_METHOD = 'get_currencies';
const NATIVE_NEAR = 'near.near';
const FT_NEAR = 'wrap.near';
const FT_AURORA = 'd9c2d319cd7e6177336b0a9c93c21cb48d84fb54.factory.bridge.near';

async function tvl() {
    let spotFtCurrencies = (await call(SPOT_PROJECT_CONTRACT, GET_CURRENCIES_METHOD, {}))
        .filter(token => token['address'] !== NATIVE_NEAR)
        .map(token => token['address'])
        .filter(address => typeof address === 'string' && address.includes('.'));

    // NOTE: replace correct aurora token address for Near Protocol with incorrect but working
    spotFtCurrencies['aurora'] = spotFtCurrencies[FT_AURORA];
    delete spotFtCurrencies[FT_AURORA];

    // NOTE: balances for spot FT tokens
    let balances = await addTokenBalances(spotFtCurrencies, SPOT_PROJECT_CONTRACT);

    // NOTE: add near balance for spot
    const spot_contract_state = await view_account(SPOT_PROJECT_CONTRACT);
    sumSingleBalance(balances, FT_NEAR, spot_contract_state['amount']);
    return balances;
}

module.exports = {
  timetravel: false,
  near: { tvl },
  methodology: 'Summed up all the tokens deposited into Spin DEX'
}
