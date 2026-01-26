const CONFIG = {
  ethereum: { blacklistedVaults: [
    '0x4a9e282635567cc4d3c6a24e16c2335f10dee9b8',
    '0xaeeafb1259f01f363d09d7027ad80a9d442de762',
    '0x39a1f8e5d2422ccc5e08c5b4019ab70147f5cc95',
    '0x4ebfc11ad2dd1c2a450ba194558d797ee5d305a6',
    '0x54fa13a38a690bc69584a7ac8b834c1770959974',
    '0x83706a2ec580fe1fdb84744366fa02fb8e25d29d',
    '0xfbadc4f18ddc7ebdbc920d3f9b0ca7a1296788d1',
    '0x7ef4d0168b12b168f14b67c708bc16f7e8bf3dec',
    '0x265329c8f15671d7ca501710e3bd0e6cb257948f'
  ] },
  arbitrum: { blacklistedVaults: [
    '0xd3a17928245064b6df5095a76e277fe441d538a4',
    '0xabc07bf91469c5450d6941dd0770e6e6761b90d6',
    '0x6f28cafe12bd97e474a52bcbfea6f2c18ae0f53d',
    '0x0ace2dc3995acd739ae5e0599e71a5524b93b886',
    '0xb9bfbb35c2ed588a42f9fd1120929c607b463192',
    '0xbc323e3564fb498e55cdc83a3ea6bb1af8402d6b',
    '0x1fd865a55eaf5333e6374fb3ad66d22e9885d3aa',
    '0x866eb09d3d1397b8a28cfe5dceeaed9362840385',
    '0xd63ace62b925361fc588734022718e919a8081ac',
    '0xa135d7f10545e3a45e24e79ecd4e4c3c78cf56bf'
  ] },
  polygon: {},
  bsc: {},
  avax: {},
  optimism: {},
  base: {},
  fantom: { factory: '0xbc85043544CC2b3Fd095d54b6431822979BBB62A' },
  blast: {},
  linea: {}
}


const DEFAULT_FACTORY = '0xD85ec15A9F814D6173bF1a89273bFB3964aAdaEC'
const SUPERVAULT_AGGREGATOR = '0x10AC0b33e1C4501CF3ec1cB1AE51ebfdbd2d4698'


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
    [1707350400, "Early Access"],
    [1715212800, "Open Launch"],
    [1734012000, "SuperVaults Launch"],
    [1764802000, "SuperVaults v2 Launch"],
  ]
};


Object.keys(CONFIG).forEach(chain => module.exports[chain] = { tvl })