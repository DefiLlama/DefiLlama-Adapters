const VAULT = '0xA940860e5894A756252F50400014217D0CB4B955'

async function tvl(api) {
  const assets = await api.call({ target: VAULT, abi: 'address[]:allAssets' })
  const totals = await api.multiCall({ target: VAULT, abi: 'function totalAssetsOf(address asset) view returns (uint256)', calls: assets })
  api.add(assets, totals)
}

module.exports = {
  methodology: "TVL is every listed asset users hold in the Ensify vault on Base: the idle balance kept in the vault plus what the vault has deployed to Aave V3 and Morpho vaults, as reported per asset by the vault's totalAssetsOf. The deployed part is also counted in Aave V3's and Morpho's TVL, hence doublecounted.",
  doublecounted: true,
  start: '2026-09-28',
  base: { tvl },
}
