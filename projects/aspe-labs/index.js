const CORE_VAULT = '0xe67c82f0970D66d8b84dB43F2392E77CE7e4ED75';

async function tvl(api) {
  const asset = await api.call({ abi: 'address:asset', target: CORE_VAULT });
  const total = await api.call({ abi: 'uint256:totalAssets', target: CORE_VAULT });
  api.add(asset, total);
}

module.exports = {
  doublecounted: true,
  methodology: 'TVL is totalAssets() of the ERC4626 vault, including USDC held in the vault contract, USDC reserved for claimable redemptions, and equity value in the HyperCore agent wallet deployed for grid trading.',
  hyperliquid: { tvl },
};
