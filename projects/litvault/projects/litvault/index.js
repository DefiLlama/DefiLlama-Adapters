const { sumTokens2 } = require("../helper/unwrapLPs");

const LITVAULT_ADDRESS = "0x24b653b62533427E0b70e92c0e3a3E4D15597e64";
const ZKLTC_ADDRESS = "0xc252c356DeA3ccf3cbC0632810563117C628751E";

async function tvl(api) {
  return sumTokens2({
    api,
    tokens: [ZKLTC_ADDRESS],
    owners: [LITVAULT_ADDRESS],
  });
}

module.exports = {
  liteforge: { tvl },
  methodology:
    "TVL is the total zkLTC deposited into the LitVault contract on LiteForge Testnet. " +
    "Vault shares (lvzkLTC) are excluded to avoid double counting.",
};
