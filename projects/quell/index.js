const { sumERC4626VaultsExport } = require("../helper/erc4626");

const RWA_VAULT = "0xd85A4301706124699CbA8d0b59E5ED635360868b";

module.exports = {
  doublecounted: true,
  methodology:
    "TVL is the total USDC deposited in the Quell RWAVault, an ERC-4626 vault on Base that routes to the Steakhouse USDC MetaMorpho vault for RWA yield.",
  base: {
    tvl: sumERC4626VaultsExport({ vaults: [RWA_VAULT] }),
  },
};
