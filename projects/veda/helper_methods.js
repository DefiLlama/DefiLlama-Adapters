async function sumLegacyTvl({ vaults, api, ownersToDedupe = [] }) {
  const [assets, bals] = await Promise.all([
    api.multiCall({
      abi: "address:asset",
      calls: vaults,
    }),
    api.multiCall({
      abi: "uint256:totalAssets",
      calls: vaults,
    })
  ]);

  await deduplicateAndAdd({ vaults, assets, bals, api, ownersToDedupe, type: 'Legacy' });
}

async function sumBoringTvl({ vaults, api, ownersToDedupe = [] }) {

  const boringCalls = vaults.map((vault) => ({
    target: vault.lens,
    params: [vault.id, vault.accountant],
  }));

  const boringBalances = await api.multiCall({
    abi: "function totalAssets(address boringVault, address accountant) view returns (address asset, uint256 assets)",
    calls: boringCalls,
  });

  const assets = boringBalances.map(b => b.asset);
  const bals = boringBalances.map(b => b.assets);
  const vaultAddresses = vaults.map(v => v.id);
  const lensAddresses = vaults.map(v => v.lens);

  await deduplicateAndAdd({ 
    vaults: vaultAddresses, 
    assets, 
    bals, 
    api, 
    ownersToDedupe, 
    type: 'Boring',
    lensAddresses 
  });
}

async function deduplicateAndAdd({ vaults, assets, bals, api, ownersToDedupe = [], type, lensAddresses }) {
  if (!vaults.length || !ownersToDedupe.length) {
    assets.forEach((a, i) => api.add(a, bals[i]));
    return;
  }

  // Prepare all calls at once
  const [sharesToIgnore, totalShares] = await Promise.all([
    // Get all shares to ignore in one batch
    type === 'Boring' 
      ? api.multiCall({
          calls: vaults.flatMap((target, idx) => 
            ownersToDedupe.map(owner => ({
              target: lensAddresses[idx],
              params: [owner.id, target],
            }))
          ),
          abi: "function balanceOf(address account, address vault) view returns (uint256)",
        })
      : api.multiCall({
          calls: vaults.flatMap(target => 
            ownersToDedupe.map(owner => ({
              target,
              params: [owner.id],
            }))
          ),
          abi: "erc20:balanceOf",
        }),
    // Get all total supplies in one batch
    api.multiCall({
      calls: vaults.map(vault => ({
        target: vault,
      })),
      abi: "uint256:totalSupply",
    })
  ]);

  // Process shares to ignore
  const chunkedShares = chunk(sharesToIgnore, ownersToDedupe.length);
  const summedShares = chunkedShares.map(shares => 
    shares.reduce((sum, share) => sum + Number(share), 0)
  );

  // Calculate ratios
  const ratios = totalShares.map((share, i) => {
    return 1 - summedShares[i] / share;
  });
  
  assets.forEach((a, i) => api.add(a, bals[i] * ratios[i]));
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