/**
 * Mycelium Vaults - Auto-Compound Yield Optimizer on Berachain
 * 
 * @description Deposits LP tokens into Infrared Gauges and auto-compounds
 * iBGT rewards every 30 minutes. Charges 1% fee vs Beefy 4.5%.
 * @see https://berascan.com/address/0x3B4d6c8C73962218724ea140Ad7c7CD13dCF165E
 */

/** Vault contract address on Berachain */
const WBERA_HONEY_VAULT = "0x3B4d6c8C73962218724ea140Ad7c7CD13dCF165E";

/** Kodiak Island WBERA-HONEY LP token */
const WBERA_HONEY_LP = "0x4a254B11810B8EBb63C5468E438FC561Cb1bB1da";

/**
 * Calculates TVL by reading totalAssets() from the ERC-4626 vault.
 * This returns the total LP tokens staked in the Infrared Gauge.
 * @param {object} api - DefiLlama SDK API instance
 */
async function berachainTvl(api) {
  const assets = await api.call({ abi: "uint256:totalAssets", target: WBERA_HONEY_VAULT });
  api.add(WBERA_HONEY_LP, assets);
}

module.exports = {
  doublecounted: true,
  methodology: "TVL counts LP tokens held by Mycelium vaults and staked in Infrared gauges.",
  berachain: { tvl: berachainTvl },
};
