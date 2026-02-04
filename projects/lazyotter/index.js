// [usdc, weth, wstETH]
const aaveVaults = ["0xF91caE959D134065f39DDaa41d66E254dfaFc6f8", "0x81A47E298d634273Afe43AD58EaC5888983d21c4", "0x22EdDd86Ee6e1dcD2eAb06f80ee39B3c084a1E77"];

// [eth/usdc, eth/wbtc, eth/wrsETH, eth/wstETH, usdc/usdt]
const ambientVaultHelper = "0x9b5BD88893d73d114d252Cff7CFd4f2705eEFAe7"
const ambientVaults = ["0x07ab0C3A3D9e286ba790FF57f205970bC462BB21", "0x018B3ac371344735025cB01d79871Be0e4AB351C", "0x7D1E707011bA5be76806037532c266fA6eb0699f", "0xe18acadfb098fbf4017108a5C83Fa901B062a53d", "0xfbB0D0cB3324Ec90c6667D9E2b8B98dB8F73a3e6"]

// [USDC, USDT, wstETH, weETH, wrsETH, STONE]
const rhoMarketsVault = [
  "0x1BA2A898b5EfB716557696e3E42E6479882fCDE1",
  "0x87131c9Bb4878067742dd5D60596ED3b353493FD",
  "0xfAe6c6E62bc5374a229960891Ec9707e8671a219",
  "0x74a28efb7275c3871aCCaE2917f6EE073039042d",
  "0x4220F7297eBa7cE583826eC754A0CBE29E4e6F6f",
  "0x235ea5d1EA9407334E0AF8F45BA6c9A69DF9AC18"
]

async function tvl(api) {
  await api.erc4626Sum2({ calls: aaveVaults.concat(rhoMarketsVault), });
  const ambAssets = await api.multiCall({  abi: 'uint256:totalAssets', calls: ambientVaults})
  const calls = ambAssets.map((v, i) => ({ params: [ambientVaults[i], v]}))
  const res = await api.multiCall({ abi: 'function previewAmountByAsset(address vault, uint256 assets) view returns (uint256, uint256)', calls, target: ambientVaultHelper})
  const quoteTokens = await api.multiCall({  abi: 'address:quoteToken', calls: ambientVaults})
  const baseTokens = await api.multiCall({  abi: 'address:baseToken', calls: ambientVaults})
  for (const i in res){
    api.add(quoteTokens[i], res[i][0])
    api.add(baseTokens[i], res[i][1])
  }
}

module.exports = {
  methodology: "Returns the total assets owned by the LazyOtter Vault on Scroll.",
  scroll: {
    tvl,
  },
};
