const CONFIG = {
  ethereum: [
    '0x3ee320c9f73a84d1717557af00695a34b26d1f1d', // XEVT
    '0x0bbc2be1333575f00ed9db96f013a31fdb12a5eb', // TBV1
    '0x30c3115dca6370c185d5d06407f29d3ddbc4cfc4', // TBV2
    '0x7bfb97fe849172608895fd4c62237cb42a8607d2', // TBV3
    '0xa65446265517a29f7427abb1279165eb61624dd0', // TBV4
    '0x0f8cbdc544dc1d4bd1bdafe0039be07b825af82a', // XTBT
  ], 
  avax: [
    '0xbb9360d57f68075e98d022784c12f2fda082316b', // XRV1
    '0xad6605f4987031fd2d6d6816be53eb7c5b764bf7', // XTBT
  ]
}


const tvl = async (api, tokens) => {
  const [assets, balances] = await Promise.all([
    api.multiCall({ calls: tokens, abi: 'address:liquidityAssetAddr' }),
    api.multiCall({ calls: tokens, abi: 'uint256:totalAssets' }),
  ])
  api.add(assets, balances)
}

Object.entries(CONFIG).forEach(([chain, tokens]) => {
  module.exports[chain] = { tvl: async (api) => tvl(api, tokens) }
})