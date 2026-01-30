const { getConfig } = require('../helper/cache');

let _vaultsApiResponse
const EXCLUDED_TYPES = new Set(['core-vault', 'dvv-vault'])

const tvl = async (api) => {
  const chainId = Number(api.chainId)
  if (!_vaultsApiResponse) _vaultsApiResponse = getConfig('mellow-v2', 'https://points.mellow.finance/v1/vaults')
  const vaultsApiResponse = await _vaultsApiResponse;

  const erc4626Vaults = vaultsApiResponse.filter(v => v && !EXCLUDED_TYPES.has(v.type) && Number(v.chain_id) === chainId)
  await api.erc4626Sum({ calls: erc4626Vaults.map(vault => vault.address), tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets', permitFailure: true });
}

const chains = ['ethereum', 'bsc', 'fraxtal', 'lisk', 'monad']

module.exports.doublecounted = true

chains.forEach((chain) => {
  module.exports[chain] = { tvl }
})