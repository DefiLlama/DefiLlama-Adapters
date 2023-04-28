const { getCache } = require('../helper/http');
const { sumTokens2 } = require('../helper/unwrapLPs')
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

module.exports = {};

Object.keys(chains).forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const vaultData = await getVaults(chain)
      const vaults = vaultData.map(i => i.id)
      const beefys = await api.multiCall({ abi: 'address:BEEFY_VAULT', calls: vaults, permitFailure: true, })
      const tokens = vaultData.map((v, i) => beefys[i] ? beefys[i] : v.underlying_asset)
      return sumTokens2({ api, tokensAndOwners2: [tokens, vaults] })
    }
  }
})