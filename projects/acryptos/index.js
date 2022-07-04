const utils = require('../helper/utils');
const { toUSDTBalances } = require('../helper/balances');
let _response


function fetchallchain(chainId) {
  return async () => {
    if (!_response) _response = utils.fetchURL('https://api.unrekt.net/api/v2/acryptos-asset')
    const response = await _response;

    let tvl  = 0;
    const total_tvl = response.data.acryptos.total_tvl;

    tvl = total_tvl[chainId];
    return toUSDTBalances(tvl);
  }
}



module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "Acryptos TVL is the USD value of token within the vault and farm contracts",
  bsc: {
    tvl: fetchallchain(56),
  },
  cronos: {
    tvl: fetchallchain(25),
  },
  avalanche: {
    tvl: fetchallchain(43114),
  },
  fantom: {
    tvl: fetchallchain(250),
  },
  moonriver: {
    tvl: fetchallchain(1285),
  },
  moonbeam: {
    tvl: fetchallchain(1284),
  },
  harmony: {
    tvl: fetchallchain(1666600000),
  }
  

}


