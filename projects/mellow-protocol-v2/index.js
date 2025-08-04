const axios = require('axios')

const config = {
  ethereum: {
    chainId: 1,
  },
  lisk: {
    chainId: 1135,
  },
  bsc: {
    chainId: 56,
  },
  fraxtal: {
    chainId: 252,
  }
}

let _vaultsApiResponse

async function fetchTvl(api, chainId) {
  if (!_vaultsApiResponse) _vaultsApiResponse = axios.get('https://points.mellow.finance/v1/vaults')
  const vaultsApiResponse = await _vaultsApiResponse;

  const vaults = vaultsApiResponse.data.filter(vault => vault.chain_id === chainId).map(vault => vault.address)

  if (vaults != null && vaults.length > 0) {
    await api.erc4626Sum({ calls: vaults, tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets', permitFailure: true });
  }
}

module.exports = {
  doublecounted: true,
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: (api) => fetchTvl(api, config[chain].chainId)
  }
})