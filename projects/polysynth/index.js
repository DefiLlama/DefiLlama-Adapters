const { getCache } = require('../helper/http');

let _response;

async function getVaults(chain) {
  if (!_response) _response = getCache('https://h.oliveapp.finance/api/rest/vaults/tvl')
  return (await _response).vault_meta_data
    .map(i => i.vault_object)
    .filter(i => i.chain_id === chains[chain])
}

const chains = {
  ethereum: '1',
  polygon: '137',
  arbitrum: '42161'
}

module.exports = {
};

Object.keys(chains).forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const vaults = await getVaults(chain)
      const calls = vaults.map(i => i.id)
      const bals = await api.multiCall({  abi: 'uint256:totalBalance', calls })
      bals.forEach((vaule, i) => api.add(vaults[i].underlying_asset,vaule))
    }
  }
})