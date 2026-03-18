const ADDRESSES = require('../helper/coreAssets.json')
const { getConfig } = require('../helper/cache');

const abi = 'function collect(address,address,(address,uint256,uint256)) view returns ((address,address,address[],uint8[],uint256[],(address,address,bool,bool,bool,uint256,uint256[])[],uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,(address,address,uint256,uint256,uint256,uint256)[],(address,address,uint256,uint256,uint256,uint256)[],uint256,uint256))'

let _vaultsApiResponse

const tvl = async (api) => {
  const chainId = Number(api.chainId)
  if (!_vaultsApiResponse) _vaultsApiResponse = getConfig('mellow-v2', 'https://points.mellow.finance/v1/vaults')
  const vaultsApiResponse = await _vaultsApiResponse;

  const vaultsOnChain = vaultsApiResponse.filter(v => v && Number(v.chain_id) === chainId)
  const coreVaults = vaultsOnChain.filter(v => v.type === 'core-vault')
  const dvvVaults  = vaultsOnChain.filter(v => v.type === 'dvv-vault')

  const calls = coreVaults.map((vault) => ({ target: vault.collector, params: [ADDRESSES.null, vault.address, [vault.base_token.address, 0, 0]] }))
  const coreVaultsResults = await api.multiCall({ calls, abi, permitFailure: true })

  coreVaultsResults.forEach((result) => {
    if (!result || !Array.isArray(result)) return
    const baseAsset = result[1]
    const amount = result[9]
    if (!baseAsset || !amount) return
    api.add(baseAsset, amount)
  })

  await api.erc4626Sum({ calls: dvvVaults.map(vault => vault.address), tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets', permitFailure: true });
}

const chains = ['ethereum', 'bsc', 'fraxtal', 'lisk', 'monad']

module.exports.doublecounted = true

chains.forEach((chain) => {
  module.exports[chain] = { tvl }
})
