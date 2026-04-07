const { getConfig } = require("../helper/cache");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const CHAIN_TO_API_NETWORK = {
  ethereum: "ethereum",
  arbitrum: "arbitrum",
  base: "base",
  avax: "avalanche",
  katana: "katana",
  flare: "flare",
};

const SPECTRA_API_BASE = "https://api.spectra.finance/v1";

const tvl = async (api) => {
  const network = CHAIN_TO_API_NETWORK[api.chain];
  if (!network) return;

  const metavaults = await getConfig(
    `spectra-metavaults-api/${network}`,
    `${SPECTRA_API_BASE}/${network}/metavaults`
  );
  if (!Array.isArray(metavaults) || !metavaults.length) return;

  const infraVaults = metavaults
    .map((mv) => mv.infraVault)
    .filter((v) => v && v.toLowerCase() !== ZERO_ADDRESS);
  if (!infraVaults.length) return;

  const [assets, totalAssets] = await Promise.all([
    api.multiCall({
      calls: infraVaults,
      abi: "function asset() view returns (address)",
      permitFailure: true,
    }),
    api.multiCall({
      calls: infraVaults,
      abi: "function totalAssets() view returns (uint256)",
      permitFailure: true,
    }),
  ]);

  assets.forEach((asset, i) => {
    const balance = totalAssets[i];
    if (!asset || asset.toLowerCase() === ZERO_ADDRESS || !balance) return;
    api.add(asset, balance);
  });
};

module.exports = {
  methodology: "TVL is the total value of assets deposited in Spectra MetaVaults.",
  hallmarks: [["2026-02-12", "MetaVaults Launch"]],
};

Object.keys(CHAIN_TO_API_NETWORK).forEach((chain) => {
  module.exports[chain] = { tvl };
});