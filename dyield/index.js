const WRAPPERS = [
  '0x98F6529DF7BF5088DB795CA1590c51d81b2175CA',
  '0xfa2c898Aa1a41DE6EE334C187983DD3875354fc4',
  '0x9AEE2D78Eb7F6781Aeb7247bB764784C1048C881',
]
async function tvl(api) {
  const assets = await api.multiCall({ abi: 'address:asset', calls: WRAPPERS })
  const balances = await api.multiCall({ abi: 'uint256:totalAssets', calls: WRAPPERS })
  api.addTokens(assets, balances)
}
module.exports = {
  methodology: 'Sum of totalAssets() across the three dyield wrapper vaults on Base. Double counted with Morpho.',
  start: 1785811569,
  base: { tvl },
  doublecounted: true,
  hallmarks: [[1785811569, 'Wrappers deployed on Base']],
}
