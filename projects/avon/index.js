const MEGAVAULT = "0x2eA493384F42d7Ea78564F3EF4C86986eAB4a890"

async function tvl(api) {
  const asset = await api.call({ target: MEGAVAULT, abi: "address:asset" })
  const totalAssets = await api.call({ target: MEGAVAULT, abi: "uint256:totalAssets" })
  api.add(asset, totalAssets)
}

module.exports = {
  timetravel: false,
  methodology: "TVL is the underlying USDm managed by MegaVault, measured via the ERC4626 totalAssets() value.",
  megaeth: { tvl },
}
