const morphoBlueAdapter = require("../morpho-blue/index.js");

const tvl = async (api) => {
  await morphoBlueAdapter.hyperliquid.tvl(api);

  const felixVaultAddresses = [
    "0x835febf893c6dddee5cf762b0f8e31c5b06938ab",
    "0xfc5126377f0efc0041c0969ef9ba903ce67d151e",
    "0x9c59a9389d8f72de2cdaf1126f36ea4790e2275e",
    "0x2900ABd73631b2f60747e687095537B673c06A76",
    "0x9896a8605763106e57A51aa0a97Fe8099E806bb3",
    "0x66c71204B70aE27BE6dC3eb41F9aF5868E68fDb6",
  ];

  const assets = await api.multiCall({
    abi: "function asset() view returns (address)",
    calls: felixVaultAddresses,
  });

  const totalAssets = await api.multiCall({
    abi: "function totalAssets() view returns (uint256)",
    calls: felixVaultAddresses,
  });

  assets.forEach((asset, i) => {
    if (asset && totalAssets[i]) {
      api.add(asset, totalAssets[i] * -1);
    }
  });
};

module.exports = {
  methodology:
    "Felix Vanilla represents direct lending markets TVL calculated as Total Morpho Blue TVL minus Felix Vaults TVL. This captures the portion of Morpho Blue markets accessed through Felix's direct lending interface rather than through managed vaults.",
  doublecounted: true,
  hyperliquid: {
    tvl,
  },
};
