/**
 * Kandle Finance - DeFiLlama TVL Adapter
 *
 * This adapter tracks Total Value Locked (TVL) for Kandle Finance.
 * Kandle Finance is a yield and fixed income protocol with ERC4626-compliant vaults.
 *
 * Protocol: https://kandle.fi
 * Docs: https://docs.kandle.fi
 * Deployed on: Arbitrum (Chain ID: 42161)
 */

const VAULTS = [
    "0x9a7F9C48100cbaCB431F19B8407f73bec39D3eCD", // Yield Vault V1
    "0xB9b6b1783ca230Cc7effECBAA371502a9cBAB594", // Fixed Vault V1
];

async function tvl(api) {
    const [assets, totalAssets] = await Promise.all([
        api.multiCall({ abi: 'function asset() view returns (address)', calls: VAULTS }),
        api.multiCall({ abi: 'function totalAssets() view returns (uint256)', calls: VAULTS }),
    ]);

    assets.forEach((asset, i) => {
        api.add(asset, totalAssets[i]);
    });
}

module.exports = {
    methodology: "TVL of Kandle Finance is the total value locked in the yield and fixed vaults",
    arbitrum: {
        tvl,
    },
};
