const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  ethereum: { factories: ['0x7fE802B891734DB681b7353bFF9E6c85ce0ab200'], nftAddress: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88' },
  base: { factories: ['0xd4E8582e36AF0E0d5c1bcd8303984870b086d3d2'], nftAddress: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1' },
  bsc: { factories: ['0x9b99ffb478894f165b0d849614d8f440469bc01a'], nftAddress: '0x7b8A01B39D58278b5DE7e48c8449c9f4F5170613' },
  arbitrum: { factories: ['0xd4E8582e36AF0E0d5c1bcd8303984870b086d3d2'], nftAddress: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88' },
  monad: { factories: ['0x8f6df209Ea8614eE44aBD4D48d007e472dEc8EdE'], nftAddress: '0x7197e214c0b767cfb76fb734ab638e2c192f4e53' },
  optimism: { factories: ['0xb2A0dE6648CF9DAC0E98d74d40E3e401C46C244B'], nftAddress: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88' },
  xdai: { factories: ['0xb2A0dE6648CF9DAC0E98d74d40E3e401C46C244B'], nftAddress: '0xAE8fbE656a77519a7490054274910129c9244FA3' },
  xlayer: { factories: ['0xb2A0dE6648CF9DAC0E98d74d40E3e401C46C244B'], nftAddress: '0x315e413A11AB0df498eF83873012430ca36638Ae' },
  robinhood: { factories: ['0xb24b143ad6bB5bE9559CcC75f34A2261b7456904'], nftAddress: '0x73991a25c818bf1f1128deaab1492d45638de0d3' },
}

const abis = {
  nextVaultId: 'uint256:nextVaultId',
  vaultInfo: 'function vaultInfo(uint256) view returns (address creatorAddress, address addr, address adapterAddress, uint256 vaultTypeId)',
  variableAsset: 'address:variableAsset',
}

async function tvl(api) {
  const { factories, nftAddress } = config[api.chain]

  const vaults = []
  const adapters = []
  for (const factory of factories) {
    const nextVaultId = await api.call({ abi: abis.nextVaultId, target: factory })
    const ids = []
    for (let i = 1; i < nextVaultId; i++) ids.push(i)
    if (!ids.length) continue
    const infos = await api.multiCall({ abi: abis.vaultInfo, calls: ids.map((id) => ({ target: factory, params: id })) })
    infos.forEach((info) => {
      if (info.addr && info.addr !== ADDRESSES.null) vaults.push(info.addr)
      if (info.adapterAddress && info.adapterAddress !== ADDRESSES.null) adapters.push(info.adapterAddress)
    })
  }

  // Variable side: each vault's variable-asset balance. permitFailure skips
  // never-initialized vaults (no variableAsset set), which hold nothing.
  const variableAssets = await api.multiCall({ abi: abis.variableAsset, calls: vaults, permitFailure: true })
  const tokensAndOwners = []
  vaults.forEach((vault, i) => {
    const asset = variableAssets[i]
    if (asset && asset !== ADDRESSES.null) tokensAndOwners.push([asset, vault])
  })

  // Fixed side: each vault's adapter holds the Uniswap V3 position NFT.
  return sumTokens2({ api, tokensAndOwners, owners: [...new Set(adapters)], resolveUniV3: true, uniV3ExtraConfig: { nftAddress } })
}

module.exports = {
  methodology:
    'Vaults are enumerated from the Saffron vault factories on each chain. TVL counts the Uniswap V3 liquidity position backing each vault (NFT held by the vault adapter) plus the variable-side deposits (variable asset balance held by the vault contract).',
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl }
})
