
const sui = require("../helper/chain/sui");
const ADDRESSES = require("../helper/coreAssets.json");

const VAULT_REGISTRY_SUI = "0xa16f2aef5db003653344700dec7a8151ba6bf029db6bbf8d70025f5a55ff042e"; // Vault Registry SUI type address
const STABILITY_POOL_SUI = "0xfe9bed337b3880bb3eb157f779a600332bb48da14fd04ae20ec8974ce60712ac"; // Stability Pool SUI type address
const DORI = "0xc436a8ccc36e649e0fd8c7cec88ca89747b69ba5bdefb15be2f93ae1ae632800::dori::DORI"; // DORI token address
const FLOWX_LIQUIDITY_POOL= "0xda208de7838d4922c3e0ced4e81ddbc94f3e4e6c2e3acf97194151dc1639424b"; // FowX liquidity pool

async function getDoriPriceFromFlowX() {
  const pool = await sui.getObject(FLOWX_LIQUIDITY_POOL);
  const doriReserves = Number(pool.fields.reserve_x) / 1e9;   // DORI decimals
  const usdcReserves = Number(pool.fields.reserve_y) / 1e6;   // USDC decimals
  if (doriReserves === 0) return 0;
  return usdcReserves / doriReserves;   // 1 DORI = ? USDC
}

async function tvl(api) {
  // Collateral in vaults (SUI)
  const registrySUI = await sui.getObject(VAULT_REGISTRY_SUI);
  const totalCollateralSUI = Number(registrySUI.fields.total_collateral) / 1e9;
  api.add(ADDRESSES.sui.SUI, totalCollateralSUI);
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
};
