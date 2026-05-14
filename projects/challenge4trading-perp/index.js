const { sumTokens2 } = require("../helper/unwrapLPs");

const PERP_ADDRESS = "0x54A62D550e1754f3bB34ad80501A63815297Fccc";
const USDC_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

module.exports = {
  methodology: "TVL for Challenge4Trading Perp (C4T) is the onchain USDC balance held by the perp contract on Arbitrum.",
  arbitrum: async (api) => {
    return sumTokens2({
      api,
      tokensAndOwners: [[USDC_ADDRESS, PERP_ADDRESS]],
    });
  },
};
