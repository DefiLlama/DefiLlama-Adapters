const { getConfig } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')
let _response;

async function getVaults(chain) {
  if (!_response) _response = getConfig('polysynth', 'https://fast-wren-87.hasura.app/api/rest/vaults/all/meta')
  return (await _response).vault_meta_data
    .filter(i => i.chain_id === chains[chain])
}

const chains = {
  ethereum: 1,
  polygon: 137,
  arbitrum: 42161
}

module.exports = {};

Object.keys(chains).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const vaultData = await getVaults(chain)
      const vaults = vaultData.map(i => i.vault_address)
      const beefys = await api.multiCall({ abi: 'address:BEEFY_VAULT', calls: vaults, permitFailure: true, })
      const tokens = vaultData.map((v, i) => beefys[i] ? beefys[i] : v.asset_address)
      return sumTokens2({ api, tokensAndOwners2: [tokens, vaults] })
    }
  }
})