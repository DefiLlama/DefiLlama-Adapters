const Address = require("../helper/coreAssets.json");
const Http = require("../helper/http");
const token = Address.arbitrum.USDC_CIRCLE

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  arbitrum: {
    tvl: async function (api) {
      const data = await Http.get("https://api.protocol.umoja.xyz/tokens/tvl/d-llama");

      for (const entry of data)
        if (entry.currency == "USDC") api.add(token, entry.tvl * 1e6)
    }
  }
};