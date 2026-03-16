const { config, ZERO_ADDRESS, getMetavaultData } = require("../spectra-metavaults/helper");

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

    // Only count metavaults known to the Spectra API
    const infraKey = infraVaults[i].toLowerCase();
    const ownerAddr = infraVaultToOwner[infraKey];
    const apiMetavault = ownerAddr ? apiOwnerMap[ownerAddr] : undefined;
    if (!apiMetavault) return;

    api.add(asset, balance);
  });
};

module.exports = {
  methodology: "TVL is the total value of assets deposited in Spectra MetaVaults.",
  hallmarks: [["2026-02-12", "MetaVaults Launch"]],
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});
