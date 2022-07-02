const { call, view_account, addTokenBalances, sumSingleBalance } = require('../helper/near');

const SPOT_PROJECT_CONTRACT = 'spot.spin-fi.near';
const GET_CURRENCIES_METHOD = 'get_currencies';
const NATIVE_NEAR = 'near.near';
const FT_NEAR = 'wrap.near';
const FT_AURORA = 'd9c2d319cd7e6177336b0a9c93c21cb48d84fb54.factory.bridge.near';


async function tvl() {
    let ftCurrencies = (await call(SPOT_PROJECT_CONTRACT, GET_CURRENCIES_METHOD, {}))
        .filter(token => token['address'] !== NATIVE_NEAR)
        .map(token => token['address']);

    // NOTE: replace correct aurora token address for Near Protocol with incorrect but working
    ftCurrencies['aurora'] = ftCurrencies[FT_AURORA];
    delete ftCurrencies[FT_AURORA];

    let balances = await addTokenBalances(ftCurrencies, SPOT_PROJECT_CONTRACT);
    
    // NOTE: usd-coin's decimals set to 18 because previously this is the right way 
    //       to adjust the decimals for coingecko
    balances['usd-coin'] = balances['usd-coin'].shiftedBy(12);

    const spot_contract_state = await view_account(SPOT_PROJECT_CONTRACT);
    sumSingleBalance(balances, FT_NEAR, spot_contract_state['amount']);

    return balances;
}


module.exports = {
  timetravel: false,
  near: {
    tvl,
  },
  methodology: 'Summed up all the tokens deposited into Spin DEX'
}
