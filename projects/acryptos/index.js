const utils = require('../helper/utils');
const { toUSDTBalances } = require('../helper/balances');
let _response


// The API carries the unix time of its last refresh in `last`. It stopped refreshing on
// 2025-07-02 and kept serving that snapshot, so refuse anything older than a day instead of
// republishing a frozen number as current TVL.
const MAX_AGE = 24 * 3600

function fetchallchain(chainId) {
  return async () => {
    if (!_response) _response = utils.fetchURL('https://api.unrekt.net/api/v2/acryptos-asset')
    const response = await _response;

    const age = Date.now() / 1000 - Number(response.data.last)
    if (!(age <= MAX_AGE)) throw new Error(`acryptos api snapshot is stale: last=${response.data.last}, ${(age / 86400).toFixed(1)} days old`)

    let tvl  = 0;
    const total_tvl = response.data.acryptos.total_tvl;

    tvl = total_tvl[chainId];
    return toUSDTBalances(tvl);
  }
}



module.exports = {
  timetravel: false,
  methodology: "Acryptos TVL is the USD value of token within the vault and farm contracts",
  misrepresentedTokens: true,
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


