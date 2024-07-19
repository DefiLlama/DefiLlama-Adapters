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
    methodology: "Acryptos TVL is the USD value of token within the vault and farm contracts",
  ethereum: {
    tvl: fetchallchain(1),
  },
  optimism: {
    tvl: fetchallchain(10),
  },
  cronos: {
    tvl: fetchallchain(25),
  },
  bsc: {
    tvl: fetchallchain(56),
  },
  xdai: {
    tvl: fetchallchain(100),
  },
  polygon: {
    tvl: fetchallchain(137),
  },
  fantom: {
    tvl: fetchallchain(250),
  },
  astar: {
    tvl: fetchallchain(592),
  },
  moonbeam: {
    tvl: fetchallchain(1284),
  },
  moonriver: {
    tvl: fetchallchain(1285),
  },
  kava: {
    tvl: fetchallchain(2222),
  },
  canto: {
    tvl: fetchallchain(7700),
  },
  arbitrum:{
    tvl: fetchallchain(42161),
  },
  avax:{
    tvl: fetchallchain(43114),
  },
  base:{
    tvl: fetchallchain(8453),
  },
  linea:{
    tvl: fetchallchain(59144),    
  },
  harmony: {
    tvl: fetchallchain(1666600000),
  }
 

}


