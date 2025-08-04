const Address = require("../helper/coreAssets.json");
const Http = require("../helper/http");

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  arbitrum: {
    tvl: async function (api) {
      const data = await Http.get("https://api.protocol.umoja.xyz/tokens/tvl/d-llama");

      for (const entry of data)
        if (entry.currency == "USDC") api.add(Address.arbitrum.USDC_CIRCLE, entry.tvl * 1e6)
    },
    staking: async (api) => {
      const lockedUmoGov = await api.call({ abi: 'erc20:balanceOf', target: "0x16A500Aec6c37F84447ef04E66c57cfC6254cF92", params: "0x256F7b822594a1Bc5cB5a68f0A7d97C8F3F2711C" })
      api.add("0x16A500Aec6c37F84447ef04E66c57cfC6254cF92", lockedUmoGov)
    },
  }
};