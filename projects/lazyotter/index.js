// [usdc, weth, wstETH]
const aaveVaults = ["0xF91caE959D134065f39DDaa41d66E254dfaFc6f8", "0x81A47E298d634273Afe43AD58EaC5888983d21c4", "0x22EdDd86Ee6e1dcD2eAb06f80ee39B3c084a1E77"];
const aTokens = ["0x1D738a3436A8C49CefFbaB7fbF04B660fb528CbD", "0xf301805bE1Df81102C957f6d4Ce29d2B8c056B2a", "0x5B1322eeb46240b02e20062b8F0F9908d525B09c"];

// [eth/usdc, eth/wbtc, eth/wrsETH, eth/wstETH, usdc/usdt]
const ambientVaults = ["0x07ab0C3A3D9e286ba790FF57f205970bC462BB21", "0x018B3ac371344735025cB01d79871Be0e4AB351C", "0x7D1E707011bA5be76806037532c266fA6eb0699f", "0xe18acadfb098fbf4017108a5C83Fa901B062a53d", "0xfbB0D0cB3324Ec90c6667D9E2b8B98dB8F73a3e6"]

async function tvl(api) {
  // Aave vaults
  const tokens = await api.multiCall({ abi: "address:asset", calls: aaveVaults });

  // Ambient vaults
  const lpTokens = await api.multiCall({ abi: "address:asset", calls: ambientVaults });

  const tokensAndOwners2 = [
    [...tokens, ...aTokens, ...lpTokens],
    [...aaveVaults, ...aaveVaults, ...ambientVaults]
  ];
  return api.sumTokens({ tokensAndOwners2, resolveLP: true,});
}

module.exports = {
  methodology: "Returns the total assets owned by the LazyOtter Vault on Scroll.",
  scroll: {
    tvl,
  },
};
