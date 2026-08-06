const WRAPPERS = [
  '0x6fc2670a0e3ecFfAc27c66009530f16BC07cd2Cc', // dyield Prime — d$P
  '0x80729552cb813d95d54474c0E7e9E5ed8F5A8D89', // dyield High  — d$H
  '0xB7E50801E30cB5eF02b95D1bbc8363bc260197FF', // dyield Ultra — d$U
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
  hallmarks: [['2026-08-05', 'Wrappers deployed on Base']],
}
