const { callSoroban } = require("../helper/chain/stellar");

// Untangled Finance Stellar V2 Curator Vault
// The vault is a Soroban contract with a `total_assets` view function
// that returns the total value locked in the underlying asset (USDC, 7 decimals)
const VAULTS = [
  {
    name: "USDyc2",
    contract: "CDDDLSQAR6EVIBFU6KMHA6WLIZJ5PDPXKJCEADD6YJ3HJ3S775XHVEE4",
  },
];

const USDC_DECIMALS = 7;

async function tvl(api) {
  let totalUSD = 0;

  for (const vault of VAULTS) {
    const totalAssets = await callSoroban(vault.contract, "total_assets");
    const normalized = Number(totalAssets) / 10 ** USDC_DECIMALS;
    totalUSD += normalized;
  }
  api.addCGToken("usd-coin", totalUSD);
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL is the total_assets from the Untangled Curator Vault on Stellar. The vault reports its total deposited value in USDC via the Soroban total_assets view function.",
  stellar: {
    tvl,
  },
};
