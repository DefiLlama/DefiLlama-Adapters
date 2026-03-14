const { getConfig } = require('../helper/cache');

async function tvl(api) {
  const data = await getConfig('yld', 'https://yldfi.co/api/vaults');

  // Only include strategy vaults (keys starting with "ys"), excluding wrapper
  // vaults (keys starting with "y" but not "ys") to avoid double counting
  const vaults = Object.entries(data)
    .filter(([key, v]) => key.startsWith('ys') && v && typeof v === 'object' && v.address)
    .map(([, v]) => v.address);

  const assets = await api.multiCall({ abi: 'address:asset', calls: vaults });
  const totalAssets = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaults });
  api.addTokens(assets, totalAssets);
}

module.exports = {
  methodology: 'TVL is the sum of totalAssets() across all yld ERC-4626 strategy vaults.',
  doublecounted: true,
  ethereum: { tvl },
};
