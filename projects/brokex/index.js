const { sumTokens2 } = require("../helper/unwrapLPs");

const VAULT_ADDRESS = "0x589178934112DbBa96C17384079206a21B4F20DA";
const USDC_ADDRESS = "0xc879c018db60520f4355c26ed1a6d572cdac1815";

module.exports = {
  methodology: "TVL is computed by summing the balance of USDC locked in the BrokexVault contract.",
  start: 1780443809, // June 3, 2026 (creation timestamp of BrokexVault)
  pharos: {
    tvl: async (api) => {
      return sumTokens2({
        api,
        owner: VAULT_ADDRESS,
        tokens: [USDC_ADDRESS],
      });
    },
  },
};
