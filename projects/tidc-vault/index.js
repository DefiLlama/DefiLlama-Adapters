// projects/tidc-rwa-vault.js
module.exports = {
  methodology: "TVL is obtained by calling `getTVL()` on the TidcRWAVault contract on XDC Network. The contract already returns the value in USDL-equivalent (18 decimals). Since USDL is pegged 1:1 to USD, we map it to coingecko:tether for pricing purposes.",
  xdc: {
    tvl: async (api) => {
      const vault = "0x0D5363Cc47A41070DD8618a4b3F2bD700886043c";

      // chama getTVL() que já retorna TVL em "USDL equivalent" (18 decimals)
      const tvl = await api.call({
        target: vault,
        abi: "function getTVL() view returns (uint256)"
      });

      // Map USDL -> coingecko:tether (1:1 USD stablecoin)
      const balances = {};
      balances['coingecko:tether'] = Number(tvl) / (10 ** 18);
      return balances;
    }
  }
}
