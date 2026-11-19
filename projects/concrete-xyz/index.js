const { getConfig } = require('../helper/cache')

const URL = 'https://apy.api.concrete.xyz/v1/vault:tvl/all'

const abis = {
  asset: "address:asset",
  totalAssets: "uint256:totalAssets",
  cachedTotalAssets: "uint256:cachedTotalAssets",
}

// When a vault's assets left its accounting for good (migrated to another chain or vault), keyed by
// `${chain}:${vault}`. The contract keeps reporting the assets it no longer backs after that instant.
const valuelessSince = {
  // Berachain campaign, mainnet side: positions migrated to Berachain
  'ethereum:0x34bdba9b3d8e3073eb4470cd4c031c2e39c32da8': '2025-05-06T12:00:00Z', // ctLBTC
  'ethereum:0x52c2bc859f5082c4f8c17266a3cd640b5047370e': '2025-05-06T12:00:00Z', // ctWBTC
  'ethereum:0x9dc37e4a901b1e21bd05e75c3b9a633a17001a39': '2025-05-06T12:00:00Z', // ctUSDe
  'ethereum:0xf80c6636f9597d6a7fc1e5182b168b71e98fd1cb': '2025-05-06T12:00:00Z', // ctsUSDe
  'ethereum:0x61e2de83bbab5a7a5bb2c5d40a5f737135eeaa13': '2025-05-06T12:00:00Z', // ctberaEth
  // Movement campaign: positions moved to the Movement network
  'ethereum:0x3334fd638c814f0e88e843079d4d4b1e0a766c84': '2025-04-14T12:00:00Z',
  'ethereum:0x7ec9ce669c6291de3be12c60e1b491deca7a238e': '2025-04-14T12:00:00Z',
  'ethereum:0x0a807c39f3d3baa9780a2bf8649ff1da6cdf5b4b': '2025-04-14T12:00:00Z',
  'ethereum:0x4cb213dafa6145cfc78b83cbe328e654bac681d6': '2025-04-14T12:00:00Z',
  'ethereum:0xdb5942f0c40e8f700de6a664dd5d58073a7b70a6': '2025-04-14T12:00:00Z',
  'ethereum:0x5224081801abaab688967ce6bb4937cab6b6bcbc': '2025-04-14T12:00:00Z',
  'ethereum:0x78c87aeaeb1773467683bbb517f00d62553471ec': '2025-04-14T12:00:00Z',
  'ethereum:0x7c8a4e0ea7030034fa8490b25e1f966a64e68ae4': '2025-04-14T12:00:00Z',
  'ethereum:0x50307a99cb7250f6b5c717366189d896e09fae32': '2025-04-14T12:00:00Z',
  'ethereum:0x1972839251f75c5829420a1bc259aa932fefebe0': '2025-04-14T12:00:00Z',
  'ethereum:0x859bbfd9e28b2fb1da75241096dcaf73e07a70a7': '2025-04-14T12:00:00Z',
  'ethereum:0x17438b7fe6c363ed361a804c7406bee37db8bbfc': '2025-04-14T12:00:00Z',
  'ethereum:0x86dd4516a575a1dd852467acb2cdca1d00f57760': '2025-04-14T12:00:00Z',
  'ethereum:0xe98a6ffbc2b6632b410128c15a23b114297dba5d': '2025-04-14T12:00:00Z',
  'ethereum:0x124313cf1771b3080849aa43fe113596a94125b6': '2025-04-14T12:00:00Z',
  'ethereum:0x50062d850e921dd55cdd8c607ba33ba3377631aa': '2025-04-14T12:00:00Z',
  'ethereum:0xd0f744c96e7d84e61f0fa0506a89ad6625e51aa0': '2025-04-14T12:00:00Z',
  'ethereum:0x4f4f221ff09b01dfd2ef2206da581262b04b9858': '2025-04-14T12:00:00Z',
  'ethereum:0x9694ab1b52e51e56390ec5fd3e6f78daae97c312': '2025-04-14T12:00:00Z',
  'ethereum:0x789225832e55961fa6b805e1a31a15e2d262647f': '2025-04-14T12:00:00Z',
  'ethereum:0x171e93b31c6e0a9fd1dca90d43d8401f5c72c8e5': '2025-04-14T12:00:00Z',
  'ethereum:0xc2ded1d6215d6dfe457e1191e2c47c89b32098db': '2025-04-14T12:00:00Z',
  // Corn campaign: positions moved to Corn
  'ethereum:0x6efc9e023ba7f64ef8431b671b15f1d32439f0ae': '2025-05-26T11:00:00Z',
  'ethereum:0x5a35b8817cb92dcd7196b243351f018c4982c010': '2025-05-26T11:00:00Z',
  'ethereum:0xb1cdf3c96000330f018b7d7df5bee5e7f9e13b62': '2025-05-26T11:00:00Z',
  'ethereum:0x3eb6464a77d7b619aaafa7e9ffc0fbe3ed7084b3': '2025-05-26T11:00:00Z',
  // Stable pre-deposit vaults: assets bridged to Stable
  'ethereum:0x6503de9fe77d256d9d823f2d335ce83ece9e153f': '2025-12-04T12:43:55Z', // ctStableUSDT
  'ethereum:0x4def5abcfba7babe04472ee4835f459daf4bd45f': '2025-12-04T13:36:58Z', // ctStablefrxUSD
  // V1 -> V2 migration of ctWBTC
  'ethereum:0xacce65b9db4810125addea9797baaaaad2b73788': '2026-03-20T15:33:23Z',
  // USD.ai vaults wound down
  'arbitrum:0x62ddf301b21970e7cc12c34caac9ce9bc975c0a9': '2025-11-19T00:00:00Z', // autoUSDai
  'arbitrum:0xe2d8267d285a7ae1edf48498ff044241d04e9608': '2025-11-19T00:00:00Z', // autoSUSDai
  // Berachain campaign vaults that migrated again
  'berachain:0xf0d94806e6e5cb54336ed0f8de459659718f149c': '2025-07-16T10:11:46Z', // ctLBTC
  'berachain:0xaebecae444ac70aba0385fec4cb11eb26a12c92b': '2025-07-16T10:11:46Z', // ctWBTC
  'berachain:0x59e24f42cae1b82c8b2dc79ea898f2f8b4986dfc': '2025-07-16T10:11:46Z', // ctUSDe
  'berachain:0xda785861aa6fd80d1388f65693cd62d8a1e2956a': '2025-07-16T10:11:46Z', // ctsUSDe
  'berachain:0x179b6b2a213c0bb79073f0a9b90daf42c41c6883': '2025-07-16T10:11:46Z', // ctBeraEth
  'berachain:0xb6e3c1154e07f8a3dc04a9a28648c7aa30511120': '2025-10-02T14:35:51Z', // ctBeraLBTC
  'berachain:0x335e7b56054f830883d1509afdce58dedcefb29c': '2025-10-02T14:35:51Z', // ctBeraWBTC
}

const isTest = (v) => /test/i.test(v.name || '') || /test/i.test(v.symbol || '')

const tvl = async (api) => {
  const at = api.timestamp || Math.floor(Date.now() / 1e3)
  const data = await getConfig('concrete-xyz/vaults', URL)
  const listed = Object.values(data[api.chainId]).filter(v => v.address)
  const concreteVaults = new Set(listed.map(v => v.address.toLowerCase()))
  const vaults = listed
    .filter(v => Number(v.tvl) > 0 && !isTest(v))
    .filter(v => {
      const since = valuelessSince[`${api.chain}:${v.address.toLowerCase()}`]
      return !since || at <= Math.floor(new Date(since).getTime() / 1e3)
    })

  const addresses = vaults.map(v => v.address)
  const assets = await api.multiCall({ calls: addresses, abi: abis.asset })
  const totalAssets = await api.multiCall({ calls: addresses, abi: abis.totalAssets, permitFailure: true })
  // V2 totalAssets() reverts while the vault's accounting is stale or the vault is paused; cachedTotalAssets()
  // is the last valuation the vault accepted. V1 vaults have no cache, so those stay excluded.
  const stale = addresses.map((address, i) => (totalAssets[i] === null ? address : null)).filter(Boolean)
  const cached = await api.multiCall({ calls: stale, abi: abis.cachedTotalAssets, permitFailure: true })
  stale.forEach((address, j) => { totalAssets[addresses.indexOf(address)] = cached[j] })

  let apiTvl = 0
  for (let i = 0; i < vaults.length; i++) {
    if (!totalAssets[i]) continue;
    // a vault whose asset is another Concrete vault holds shares already counted at that vault
    if (concreteVaults.has(assets[i].toLowerCase())) continue;
    api.add(assets[i], totalAssets[i])
    apiTvl += Number(vaults[i].tvl)
  }

  // throws if onchain tvl is >10% above API tvl (not thrown on historic runs since api tvl is always current)
  if (!api.timestamp || api.timestamp > Date.now() / 1e3 - 3600) {
    const onchainTvl = await api.getUSDValue()
    if (onchainTvl > apiTvl * 1.1) throw new Error(`concrete-xyz ${api.chain}: onchain TVL $${onchainTvl.toFixed(0)} is >10% above API TVL $${apiTvl.toFixed(0)}`)
  }
}

const chains = ['ethereum', 'berachain', 'arbitrum', 'katana', 'stable']
chains.forEach((chain) => {
  module.exports[chain] = { tvl }
})
