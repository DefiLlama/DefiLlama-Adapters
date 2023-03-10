const { call, view_account, addTokenBalances, sumSingleBalance } = require('../helper/chain/near');

const SPOT_PROJECT_CONTRACT = 'spot.spin-fi.near';
const GET_CURRENCIES_METHOD = 'get_currencies';
const NATIVE_NEAR = 'near.near';
const FT_NEAR = 'wrap.near';
const FT_AURORA = 'd9c2d319cd7e6177336b0a9c93c21cb48d84fb54.factory.bridge.near';

const PERP_PROJECT_CONTRACT = 'v2_0_2.perp.spin-fi.near';
const GET_BASE_CUURENCY_METHOD = 'get_base_currency';

const VAULT_PROJECT_CONTRACT = 'v1.vault.spin-fi.near'
const VAULT_GET_ALL = 'vault_get_all';


async function tvl() {
    let spotFtCurrencies = (await call(SPOT_PROJECT_CONTRACT, GET_CURRENCIES_METHOD, {}))
        .filter(token => token['address'] !== NATIVE_NEAR)
        .map(token => token['address']);

    // NOTE: replace correct aurora token address for Near Protocol with incorrect but working
    spotFtCurrencies['aurora'] = spotFtCurrencies[FT_AURORA];
    delete spotFtCurrencies[FT_AURORA];

    // NOTE: balances for spot FT tokens
    let balances = await addTokenBalances(spotFtCurrencies, SPOT_PROJECT_CONTRACT);

    // NOTE: add near balance for spot
    const spot_contract_state = await view_account(SPOT_PROJECT_CONTRACT);
    sumSingleBalance(balances, FT_NEAR, spot_contract_state['amount']);

    let perpFtCurrency = (await call(PERP_PROJECT_CONTRACT, GET_BASE_CUURENCY_METHOD, {}))['address'];
    
    // NOTE: add collateral balance (only USDC right now) for perp
    balances = await addTokenBalances(perpFtCurrency, PERP_PROJECT_CONTRACT, balances);

    // NOTE: add TVL for vaults
    const execution_assets = (await call(VAULT_PROJECT_CONTRACT, VAULT_GET_ALL, {"limit": "100", "offset": "0"}))
        .map(vault => vault['invariant']['execution_asset']);

    balances = await addTokenBalances(execution_assets, VAULT_PROJECT_CONTRACT, balances);

    return balances;
}


module.exports = {
  timetravel: false,
  near: {
    tvl,
  },
  methodology: 'Summed up all the tokens deposited into Spin DEX'
}
