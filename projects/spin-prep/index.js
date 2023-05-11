const { call, addTokenBalances } = require('../helper/chain/near');

const PERP_PROJECT_CONTRACT = 'v2_0_2.perp.spin-fi.near';
const GET_BASE_CUURENCY_METHOD = 'get_base_currency';

async function tvl() {
    let perpFtCurrency = (await call(PERP_PROJECT_CONTRACT, GET_BASE_CUURENCY_METHOD, {}))['address'];
    
    // NOTE: add collateral balance (only USDC right now) for perp
     return addTokenBalances(perpFtCurrency, PERP_PROJECT_CONTRACT);
}


module.exports = {
  timetravel: false,
  near: {
    tvl,
  },
}
