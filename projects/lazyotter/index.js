// [usdc, weth, wstETH]
const aaveVaults = ["0xF91caE959D134065f39DDaa41d66E254dfaFc6f8", "0x81A47E298d634273Afe43AD58EaC5888983d21c4", "0x22EdDd86Ee6e1dcD2eAb06f80ee39B3c084a1E77"];

// [eth/usdc, eth/wbtc, eth/wrsETH, eth/wstETH, usdc/usdt]
// const ambientVaults = ["0x07ab0C3A3D9e286ba790FF57f205970bC462BB21", "0x018B3ac371344735025cB01d79871Be0e4AB351C", "0x7D1E707011bA5be76806037532c266fA6eb0699f", "0xe18acadfb098fbf4017108a5C83Fa901B062a53d", "0xfbB0D0cB3324Ec90c6667D9E2b8B98dB8F73a3e6"]

async function tvl(api) {
  await api.erc4626Sum2({ calls: aaveVaults, });
  // await api.erc4626Sum2({ calls: ambientVaults, tokenAbi: 'baseToken', balanceAbi: 'totalAssets' });
}

module.exports = {
  methodology: "Returns the total assets owned by the LazyOtter Vault on Scroll.",
  scroll: {
    tvl,
  },
};
