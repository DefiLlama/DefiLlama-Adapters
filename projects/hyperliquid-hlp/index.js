const { get } = require("../helper/http");

async function tvl(api) {
  const data = await get("https://stats-data.hyperliquid.xyz/Mainnet/vaults");
  const hlp = data.find((d) => d.summary?.vaultAddress?.toLowerCase() === "0xdfc24b077bc1425ad1dea75bcb6f8158e10df303");
  api.addUSDValue(+hlp.summary.tvl)
}

module.exports = {
  hyperliquid: { tvl },
  misrepresentedTokens: true,
  doublecounted: true,
}