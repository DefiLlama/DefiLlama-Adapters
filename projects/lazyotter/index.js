// usdc, weth, wstETH
const aaveVaults = ["0xF91caE959D134065f39DDaa41d66E254dfaFc6f8", "0x81A47E298d634273Afe43AD58EaC5888983d21c4", "0x22EdDd86Ee6e1dcD2eAb06f80ee39B3c084a1E77"];
const aTokens = ["0x1D738a3436A8C49CefFbaB7fbF04B660fb528CbD", "0xf301805bE1Df81102C957f6d4Ce29d2B8c056B2a", "0x5B1322eeb46240b02e20062b8F0F9908d525B09c"];

async function tvl(api) {
  const tokens = await api.multiCall({ abi: "address:asset", calls: aaveVaults });
  const tokensAndOwners2 = [tokens.concat(aTokens), aaveVaults.concat(aaveVaults)];
  return api.sumTokens({ tokensAndOwners2 });
}

module.exports = {
  methodology: "Returns the total assets owned by the LazyOtter Vault on Scroll.",
  scroll: {
    tvl,
  },
};
