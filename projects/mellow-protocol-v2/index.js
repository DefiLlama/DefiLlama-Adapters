const { getConfig } = require('../helper/cache');

const config = {
  ethereum: {},
  lisk: {},
  bsc: {},
  fraxtal: {}
}

let _vaultsApiResponse

async function tvl(api) {
  if (!_vaultsApiResponse) _vaultsApiResponse = getConfig('mellow-v2', 'https://points.mellow.finance/v1/vaults')
  const vaultsApiResponse = await _vaultsApiResponse;

  const vaults = vaultsApiResponse.filter(vault => vault.chain_id === api.chainId).map(vault => vault.address)
  await api.erc4626Sum({ calls: vaults, tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets', permitFailure: true });
}

module.exports = {
  doublecounted: true,
};

Object.keys(config).forEach(chain => module.exports[chain] = { tvl })