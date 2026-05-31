const { sumTokens2 } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json")

const PERP_ADDRESS = "0x54A62D550e1754f3bB34ad80501A63815297Fccc";

module.exports = {
  methodology: "TVL for Challenge4Trading Perp (C4T) is the onchain USDC balance held by the perp contract on Arbitrum.",
  arbitrum: {
    tvl: async (api) =>
      sumTokens2({
        api,
        tokensAndOwners: [[ADDRESSES.arbitrum.USDC_CIRCLE, PERP_ADDRESS]],
      }),
  },
};
