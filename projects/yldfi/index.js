const { getConfig } = require('../helper/cache');

// Wrapper vaults that deposit into underlying strategies (excluded to avoid double counting)
const WRAPPER_VAULTS = [
  '0x95f19B19aff698169a1A0BBC28a2e47B14CB9a86', // ycvxCRV -> deposits into yscvxCRV
];

async function tvl(api) {
  const data = await getConfig('yldfi', 'https://yldfi.co/api/vaults');

  // Extract vault addresses, excluding wrapper vaults to avoid double counting
  const vaults = Object.values(data)
    .filter(v => v && typeof v === 'object' && v.address)
    .map(v => v.address)
    .filter(addr => !WRAPPER_VAULTS.includes(addr));

  const assets = await api.multiCall({ abi: 'address:asset', calls: vaults });
  const totalAssets = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaults });
  api.addTokens(assets, totalAssets);
}

module.exports = {
  methodology: 'TVL is the sum of totalAssets() across all yldfi ERC-4626 strategy vaults, which provide auto-compounding yield strategies.',
  doublecounted: true,
  ethereum: { tvl },
};
