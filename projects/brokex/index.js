const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

const VAULT_ADDRESS = "0xB36e1eDF743352D67E8B24C0A8BD8fc2c229EB4e";

module.exports = {
  methodology: "TVL corresponds to the total USDC collateral and liquidity deposited into the BrokexVault contract on Base.",
  start: '2026-08-30',
  base: {
    tvl: sumTokensExport({
      owner: VAULT_ADDRESS,
      tokens: [ADDRESSES.base.USDC],
    }),
  },
};
