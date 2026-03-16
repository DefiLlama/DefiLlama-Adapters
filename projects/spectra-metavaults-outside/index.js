const { config, ZERO_ADDRESS, getMetavaultData, computeSpectraAllocation } = require("../spectra-metavaults/helper");

const tvl = async (api) => {
  const sources = config[api.chain];
  const metavaultSources = sources.filter(
    ({ metavaultRegistry }) => metavaultRegistry
  );

  const data = await getMetavaultData(api, metavaultSources);
  if (!data) return;

  const { assets, totalAssets, infraVaults, infraVaultToOwner, apiOwnerMap } = data;

  assets.forEach((asset, i) => {
    const balance = totalAssets[i];
    if (!asset || asset.toLowerCase() === ZERO_ADDRESS || !balance) return;

    // Deduct the portion already deposited into Spectra (PT/YT/LP/wrapper IBT)
    // Skip entirely if we can't find this metavault in the API response
    const infraKey = infraVaults[i].toLowerCase();
    const ownerAddr = infraVaultToOwner[infraKey];
    const apiMetavault = ownerAddr ? apiOwnerMap[ownerAddr] : undefined;
    if (!apiMetavault) return;

    const spectraAmount = BigInt(computeSpectraAllocation(apiMetavault));
    const adjustedBalance = BigInt(balance) - spectraAmount;

    if (adjustedBalance > 0n) {
      api.add(asset, adjustedBalance.toString());
    }
  });
};

module.exports = {
  methodology: "TVL is the total value of assets deposited in Spectra MetaVaults, excluding the portion already deposited into Spectra (PT, YT, LP, wrapper IBT).",
  hallmarks: [["2026-02-12", "MetaVaults Launch"]],
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});
