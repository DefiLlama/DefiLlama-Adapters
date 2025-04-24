async function sumLegacyTvl({ vaults, api, ownersToDedupe = [] }) {
  try {
    const [assets, bals] = await Promise.all([
      api.multiCall({
        abi: "address:asset",
        calls: vaults,
        allowFailure: true,
      }),
      api.multiCall({
        abi: "uint256:totalAssets",
        calls: vaults,
        allowFailure: true,
      })
    ]);

    // Filter out failed calls
    const validIndices = assets.map((asset, i) => 
      asset !== null && bals[i] !== null ? i : null
    ).filter(i => i !== null);
    
    const filteredVaults = validIndices.map(i => vaults[i]);
    const filteredAssets = validIndices.map(i => assets[i]);
    const filteredBals = validIndices.map(i => bals[i]);

    await deduplicateAndAdd({ 
      vaults: filteredVaults, 
      assets: filteredAssets, 
      bals: filteredBals, 
      api, 
      ownersToDedupe, 
      type: 'Legacy' 
    });
  } catch (error) {
    console.error("Error in sumLegacyTvl:", error);
    // Continue with empty arrays to prevent complete failure
    await deduplicateAndAdd({ vaults: [], assets: [], bals: [], api, ownersToDedupe, type: 'Legacy' });
  }
}

async function sumBoringTvl({ vaults, api, ownersToDedupe = [] }) {
  try {
    //console.log('Boring vaults input:', JSON.stringify(vaults, null, 2));

    const boringCalls = vaults.map((vault) => ({
      target: vault.lens,
      params: [vault.id, vault.accountant],
    }));

    const boringBalances = await api.multiCall({
      abi: "function totalAssets(address boringVault, address accountant) view returns (address asset, uint256 assets)",
      calls: boringCalls,
      allowFailure: true,
    });

    // Filter out failed calls
    const validIndices = boringBalances
      .map((balance, i) => balance !== null ? i : null)
      .filter(i => i !== null);
    
    const filteredBoringBalances = validIndices.map(i => boringBalances[i]);
    const filteredVaults = validIndices.map(i => vaults[i]);
    
    const assets = filteredBoringBalances.map(b => b.asset);
    const bals = filteredBoringBalances.map(b => b.assets);
    const vaultAddresses = filteredVaults.map(v => v.id);
    const lensAddresses = filteredVaults.map(v => v.lens);

    await deduplicateAndAdd({ 
      vaults: vaultAddresses, 
      assets, 
      bals, 
      api, 
      ownersToDedupe, 
      type: 'Boring',
      lensAddresses 
    });
  } catch (error) {
    console.error("Error in sumBoringTvl:", error);
    // Continue with empty arrays to prevent complete failure
    await deduplicateAndAdd({ vaults: [], assets: [], bals: [], api, ownersToDedupe, type: 'Boring' });
  }
}

async function deduplicateAndAdd({ vaults, assets, bals, api, ownersToDedupe = [], type, lensAddresses }) {
  if (!vaults.length || !ownersToDedupe.length) {
    try {
      assets.forEach((a, i) => {
        if (a && bals[i]) api.add(a, bals[i]);
      });
    } catch (error) {
      console.error("Error adding assets when no owners to dedupe:", error);
    }
    return;
  }

  try {
    // Prepare all calls at once
    const [sharesToIgnore, totalShares] = await Promise.all([
      // Get all shares to ignore in one batch
      type === 'Boring' 
        ? api.multiCall({
            calls: vaults.flatMap((target, idx) => 
              ownersToDedupe.map(owner => ({
                target: lensAddresses && lensAddresses[idx],
                params: [owner.id, target],
              }))
            ),
            abi: "function balanceOf(address account, address vault) view returns (uint256)",
            allowFailure: true,
          })
        : api.multiCall({
            calls: vaults.flatMap(target => 
              ownersToDedupe.map(owner => ({
                target,
                params: [owner.id],
              }))
            ),
            abi: "erc20:balanceOf",
            allowFailure: true,
          }),
      // Get all total supplies in one batch
      api.multiCall({
        calls: vaults.map(vault => ({
          target: vault,
        })),
        abi: "uint256:totalSupply",
        allowFailure: true,
      })
    ]);

    // Replace null values with zero to avoid errors
    const safeSharesArray = sharesToIgnore.map(share => share === null ? 0 : share);
    const safeTotalShares = totalShares.map(share => share === null ? 0 : share);

    // Process shares to ignore
    const chunkedShares = chunk(safeSharesArray, ownersToDedupe.length);
    const summedShares = chunkedShares.map(shares => 
      shares.reduce((sum, share) => sum + Number(share), 0)
    );

    // Calculate ratios with safe division
    const ratios = safeTotalShares.map((share, i) => {
      // Avoid division by zero
      if (!share || share == 0) return 0;
      return 1 - summedShares[i] / share;
    });

    // Add assets with safe access
    assets.forEach((a, i) => {
      if (a && bals[i] !== undefined && bals[i] !== null && ratios[i] !== undefined && !isNaN(ratios[i])) {
        api.add(a, bals[i] * ratios[i]);
      }
    });
  } catch (error) {
    console.error(`Error in deduplicateAndAdd for ${type}:`, error);
    // Try to add assets without deduplication as fallback
    try {
      assets.forEach((a, i) => {
        if (a && bals[i]) api.add(a, bals[i]);
      });
    } catch (addError) {
      console.error("Error in fallback asset addition:", addError);
    }
  }
}

// Helper function to chunk array
function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

module.exports = {
  sumLegacyTvl,
  sumBoringTvl,
};