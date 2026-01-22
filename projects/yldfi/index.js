const { getConfig } = require('../helper/cache');

async function tvl(api) {
  const data = await getConfig('yldfi', 'https://yldfi.co/api/vaults');

  // Extract vault addresses from the API response, excluding price fields and metadata
  const vaults = Object.values(data)
    .filter(v => v && typeof v === 'object' && v.address)
    .map(v => v.address);

  const assets = await api.multiCall({ abi: 'address:asset', calls: vaults });
  const totalAssets = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaults });
  api.addTokens(assets, totalAssets);
}

module.exports = {
  methodology: 'TVL is the sum of totalAssets() across all yldfi ERC-4626 vaults, which provide auto-compounding yield strategies.',
  doublecounted: true,
  ethereum: { tvl },
};
