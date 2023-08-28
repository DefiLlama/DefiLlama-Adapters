const { call, addTokenBalances } = require('../helper/chain/near');

const VAULT_PROJECT_CONTRACT = 'v1.vault.spin-fi.near'
const VAULT_GET_ALL = 'vault_get_all';


async function tvl() {
  // NOTE: add TVL for vaults
  const execution_assets = (await call(VAULT_PROJECT_CONTRACT, VAULT_GET_ALL, { "limit": "100", "offset": "0" }))
    .map(vault => vault['invariant']['execution_asset']);

  return addTokenBalances(execution_assets, VAULT_PROJECT_CONTRACT);
}


module.exports = {
  timetravel: false,
  near: {
    tvl,
  },
}
