const CONFIG = {
  ethereum: { blacklistedVaults: [
    '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
    '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
    '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
    '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
    '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
    '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
    '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
    '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
    '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'
  ] },
  arbitrum: { blacklistedVaults: [
    '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
    '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
    '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
    '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
    '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
    '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
    '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
    '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
    '0x3211d27a1A1B8E40C7974F6951935303e6e56DBE',
    '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
    '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
  ] },
  polygon: {},
  bsc: {},
  avax: {},
  optimism: {},
  base: {},
  fantom: { factory: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1' },
  blast: {},
  linea: {}
}


const DEFAULT_FACTORY = '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'
const SUPERVAULT_AGGREGATOR = '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1'


const previewRedeemFromAbi = "function previewRedeemFrom(uint256) external view returns(uint256)"


const tvl = async (api) => {
  // Superform v1 TVL
  const { factory = DEFAULT_FACTORY, blacklistedVaults = [] } = CONFIG[api.chain]
  const forms = await api.fetchList({ lengthAbi: 'getSuperformCount', itemAbi: "function superforms(uint256) external view returns(uint256)", target: factory })
  const getSuperformRes = await api.multiCall({ abi: "function getSuperform(uint256) external view returns(address, uint32, uint64)", calls: forms, target: factory })
  const super4626 = getSuperformRes.map(v => v[0])
  const vaults = await api.multiCall({ abi: 'address:vault', calls: super4626 })


  const pairs = vaults
    .map((v, i) => ({ vault: v, s: super4626[i] }))
    .filter(p => p.vault && !blacklistedVaults.includes(p.vault.toLowerCase()))


  if (pairs.length === 0) return;
  const filteredVaults = pairs.map(p => p.vault);
  const filteredSuper4626 = pairs.map(p => p.s);


  const assets = await api.multiCall({ abi: 'address:asset', calls: filteredSuper4626 })
  const vBals = await api.multiCall({ abi: "erc20:balanceOf", calls: filteredVaults.map((v, i) => ({ target: v, params: filteredSuper4626[i] })) })
  const bals = await api.multiCall({ abi: previewRedeemFromAbi, calls: filteredSuper4626.map((v, i) => ({ target: v, params: vBals[i] })), permitFailure: true })


  bals.forEach((bal, i) => {
    const asset = assets[i]
    if (!bal || !asset) return
    api.add(asset, bal)
  })


  // SuperVault v2 TVL
  const superVaults = await api.call({ abi: 'function getAllSuperVaults() view returns (address[])', target: SUPERVAULT_AGGREGATOR, permitFailure: true })
  if (superVaults && superVaults.length > 0) {
    const svAssets = await api.multiCall({ abi: 'address:asset', calls: superVaults })
    const svTotalAssets = await api.multiCall({ abi: 'uint256:totalAssets', calls: superVaults })
    svTotalAssets.forEach((bal, i) => {
      if (!bal || !svAssets[i]) return
      api.add(svAssets[i], bal)
    })
  }
}


module.exports = {
  methodology: "counts the TVL of each superform across all the supported networks",
  hallmarks: [
    ['2024-02-08', "Early Access"],
    ['2024-05-09', "Open Launch"],
    ['2024-12-12', "SuperVaults Launch"],
    ['2025-12-03', "SuperVaults v2 Launch"],
  ]
};


Object.keys(CONFIG).forEach(chain => module.exports[chain] = { tvl })
