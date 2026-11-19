const ADDRESSES = require('../helper/coreAssets.json');

const VAULT = '0x833E5Ba510a241b21F1C60c987D1c49eB52E4a07';
const FACTORY = '0x0382B0b9FB6Ff737209C3B31D727BB9d2E2bcb53';

/**
 * Adds Quantillon's idle USDC collateral and each distinct external adapter's
 * current underlying USDC value to the balances at the requested Base block.
 * Includes external yield and losses, verifies discovery against tracked
 * principal, and excludes receipt tokens and separately held fee reserves.
 *
 * @param {import('@defillama/sdk').ChainApi} api - Block-aware chain reader and balance accumulator.
 * @returns {Promise<void>} Resolves after adding raw USDC amounts to api balances.
 * @throws {Error} If discovered principal differs from the vault total or a contract read fails.
 */
async function tvl(api) {
  const [held, externalPrincipal, vaultIds] = await Promise.all([
    api.call({ target: VAULT, abi: 'uint256:totalUsdcHeld' }),
    api.call({ target: VAULT, abi: 'uint256:totalUsdcInExternalVaults' }),
    api.call({ target: FACTORY, abi: 'function getVaultIdsByVault(address) view returns (uint256[])', params: [VAULT] }),
  ]);
  const exposures = await api.multiCall({
    target: VAULT,
    abi: 'function getVaultExposure(uint256) view returns (address adapter, bool active, uint256 principalTracked, uint256 currentUnderlying)',
    calls: vaultIds,
  });

  // Fail if collateral was deployed to an ID not discoverable through the factory.
  const discoveredPrincipal = exposures.reduce((sum, exposure) => sum + BigInt(exposure.principalTracked), 0n);
  if (discoveredPrincipal !== BigInt(externalPrincipal))
    throw new Error('Quantillon external principal does not match discovered vaults');

  // Hedger deposits already enter this counter. Fee reserves are excluded.
  api.add(ADDRESSES.base.USDC, held);
  const countedAdapters = new Set();
  for (const exposure of exposures) {
    const adapter = exposure.adapter.toLowerCase();
    if (countedAdapters.has(adapter)) continue;
    countedAdapters.add(adapter);
    // Include disabled vaults with assets and the full underlying value (including
    // unharvested yield/losses), not the principal-capped redemption backing getter.
    api.add(ADDRESSES.base.USDC, exposure.currentUnderlying);
  }
}

module.exports = {
  // First complete UTC day after the core deployment on 2026-05-12.
  start: '2026-05-13',
  doublecounted: true, // External positions are also counted by Morpho.
  methodology: 'Counts user and hedger USDC collateral tracked in QuantillonVault plus the current underlying USDC value of its external vault positions, including unharvested yield and losses. External vaults are discovered through stQEUROFactory and their adapter addresses are resolved at the queried block. Excludes QEURO, stQEURO, governance tokens, treasury balances and fee reserves. External positions overlap with Morpho TVL.',
  base: { tvl },
};
