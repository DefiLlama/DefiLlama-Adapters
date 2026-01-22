const { getConfig } = require('../helper/cache');

// Fallback vault addresses if API is unreachable
const FALLBACK_VAULTS = [
  '0xCa960E6DF1150100586c51382f619efCCcF72706', // yscvxCRV - cvxCRV compounder (strategy)
  '0x8ED5AB1BA2b2E434361858cBD3CA9f374e8b0359', // yscvgCVX - cvgCVX compounder via Tangent LiquidBoost
];

// Wrapper vaults that deposit into underlying strategies (excluded to avoid double counting)
const WRAPPER_VAULTS = [
  '0x95f19B19aff698169a1A0BBC28a2e47B14CB9a86', // ycvxCRV -> deposits into yscvxCRV
];

async function tvl(api) {
  let vaults = FALLBACK_VAULTS;

  try {
    const data = await getConfig('yldfi', 'https://yldfi.co/api/vaults');
    if (data && typeof data === 'object') {
      const apiVaults = Object.values(data)
        .filter(v => v && typeof v === 'object' && v.address)
        .map(v => v.address)
        .filter(addr => !WRAPPER_VAULTS.includes(addr));
      if (apiVaults.length > 0) {
        vaults = apiVaults;
      }
    }
  } catch (e) {
    // Use fallback vaults if API fails
  }

  const assets = await api.multiCall({ abi: 'address:asset', calls: vaults });
  const totalAssets = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaults });
  api.addTokens(assets, totalAssets);
}

module.exports = {
  methodology: 'TVL is the sum of totalAssets() across all yldfi ERC-4626 strategy vaults, which provide auto-compounding yield strategies.',
  doublecounted: true,
  ethereum: { tvl },
};
