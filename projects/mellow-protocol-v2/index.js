const sdk = require('@defillama/sdk');
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

  const coreVaultCollectResults = (
    await sdk.api.abi.multiCall({
      calls: coreVaults.map((vault) => ({ target: vault.collector, params: ['0x0000000000000000000000000000000000000000', vault.address, [vault.base_token.address, 0, 0]] })),
      abi: 'function collect(address,address,(address,uint256,uint256)) view returns ((address,address,address[],uint8[],uint256[],(address,address,bool,bool,bool,uint256,uint256[])[],uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,(address,address,uint256,uint256,uint256)[],(address,address,uint256,uint256,uint256)[],uint256,uint256))',
      permitFailure: true,
    })
  ).output.map(x => x.output);

  const coreVaultBaseAssets = coreVaultCollectResults.map(result => result[1])
  const coreVaultTvlBaseAssets = coreVaultCollectResults.map(result => result[9])
  api.add(coreVaultBaseAssets, coreVaultTvlBaseAssets)
}

module.exports = {
  doublecounted: true,
};

Object.keys(config).forEach(chain => module.exports[chain] = { tvl })