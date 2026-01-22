// yldfi ERC-4626 vault addresses on Ethereum mainnet
const vaults = [
  '0x95f19B19aff698169a1A0BBC28a2e47B14CB9a86', // ycvxCRV - cvxCRV compounder with LlamaLend collateral support
  '0xCa960E6DF1150100586c51382f619efCCcF72706', // yscvxCRV - cvxCRV compounder (strategy)
  '0x8ED5AB1BA2b2E434361858cBD3CA9f374e8b0359', // yscvgCVX - cvgCVX compounder via Tangent LiquidBoost
];

async function tvl(api) {
  const assets = await api.multiCall({ abi: 'address:asset', calls: vaults });
  const totalAssets = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaults });
  api.addTokens(assets, totalAssets);
}

module.exports = {
  methodology: 'TVL is the sum of totalAssets() across all yldfi ERC-4626 vaults, which provide auto-compounding yield strategies.',
  doublecounted: true,
  ethereum: { tvl },
};
