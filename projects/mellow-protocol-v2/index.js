const ADDRESSES = require('../helper/coreAssets.json')
const { getConfig } = require('../helper/cache');
const { sumTokens2 } = require('../helper/unwrapLPs');

const config = {
  ethereum: {},
  lisk: {},
  bsc: {},
  fraxtal: {},
  monad: {}
}

let _vaultsApiResponse

async function tvl(api) {
  if (!_vaultsApiResponse) _vaultsApiResponse = getConfig('mellow-v2', 'https://points.mellow.finance/v1/vaults')
  const vaultsApiResponse = await _vaultsApiResponse;

  const erc4626Vaults = []
  const coreVaults = []
  for (const vault of vaultsApiResponse) {
    if (vault.chain_id !== api.chainId) continue

    if (vault.type === 'core-vault') {
      coreVaults.push(vault)
    } else {
      erc4626Vaults.push(vault)
    }
  }

  await api.erc4626Sum({ calls: erc4626Vaults.map(vault => vault.address), tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets', permitFailure: true });

  const coreVaultCollectResults = await api.multiCall({
    calls: coreVaults.map((vault) => ({ target: vault.collector, params: [ADDRESSES.null, vault.address, [vault.base_token.address, 0, 0]] })),
    abi: 'function collect(address,address,(address,uint256,uint256)) view returns ((address,address,address[],uint8[],uint256[],(address,address,bool,bool,bool,uint256,uint256[])[],uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,(address,address,uint256,uint256,uint256,uint256)[],(address,address,uint256,uint256,uint256,uint256)[],uint256,uint256))',
    permitFailure: true,
  })

  const coreVaultBaseAssets = coreVaultCollectResults.map(result => result[1])
  const coreVaultTvlBaseAssets = coreVaultCollectResults.map(result => result[9])
  api.add(coreVaultBaseAssets, coreVaultTvlBaseAssets)

  return sumTokens2({ api})
}

module.exports = {
  doublecounted: true,
};

Object.keys(config).forEach(chain => module.exports[chain] = { tvl })