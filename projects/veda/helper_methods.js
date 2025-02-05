async function sumLegacyTvl({ vaults, api, ownersToDedupe = [] }) {
  const assets = await api.multiCall({
    abi: "address:asset",
    calls: vaults,
  });

  const bals = await api.multiCall({
    abi: "uint256:totalAssets",
    calls: vaults,
  });

  await deduplicateAndAdd({ vaults, assets, bals, api, ownersToDedupe, type: 'Legacy' });
}

async function sumBoringTvl({ vaults, api, ownersToDedupe = [] }) {
  console.log('Boring vaults input:', JSON.stringify(vaults, null, 2));

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

async function deduplicateAndAdd({ vaults, assets, bals, api, ownersToDedupe, type, lensAddresses }) {
  // Dedupe any potential TVL of vaults taking positions in other vaults
  const sharesToIgnore = await Promise.all(
    vaults.map(async (target, idx) => {
      if (type === 'Boring') {
        const shares = await api.multiCall({
          calls: ownersToDedupe.map((owner) => ({
            target: lensAddresses[idx],
            params: [owner.id, target], // owner.id is the account (vault), target is the underlying vault
          })),
          abi: "function balanceOf(address account, address vault) view returns (uint256)",
        });
        return shares.reduce((sum, share) => sum + Number(share), 0);
      } else {
        const shares = await api.multiCall({
          calls: ownersToDedupe.map((owner) => ({
            target: target,
            params: [owner.id],
          })),
          abi: "erc20:balanceOf",
        });
        return shares.reduce((sum, share) => sum + Number(share), 0);
      }
    })
  );

  // Get total shares for each vault
  let totalShares = await api.multiCall({
    calls: vaults.map((vault) => ({
      target: vault,  // Call directly on the vault contract for both types
    })),
    abi: "uint256:totalSupply",  // Use totalSupply for both types
  });

  // Calculate ratios to adjust TVL
  const ratios = totalShares.map((share, i) => {
    const ratio = 1 - sharesToIgnore[i] / share;
    return ratio;
  });

  //console.log(`\n${type} Vault Deduplication Details:`);
  vaults.forEach((vault, i) => {
    const originalValue = bals[i];
    const deducted = bals[i] * (sharesToIgnore[i] / totalShares[i]);
    const finalValue = bals[i] * ratios[i];
    //console.log(`Vault ${vault}:
    //Original Value: ${originalValue}
    //Deducted Amount: ${deducted}
    //Final Value: ${finalValue}
    //Deduplication Ratio: ${ratios[i] * 100}%`);
  });

  assets.forEach((a, i) => api.add(a, bals[i] * ratios[i]));
}

module.exports = {
  sumLegacyTvl,
  sumBoringTvl,
};