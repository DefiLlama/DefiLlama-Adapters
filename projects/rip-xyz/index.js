const WHYPE = "0x5555555555555555555555555555555555555555";

const VAULTS = {
  rHYPURR: {
    address: "0x0Df4f69CF9417b1817AB9579bF099537a694667B",
    asset: WHYPE,
  },
  // Future vaults added here
};

/**
 * Calculates TVL by summing each vault's totalAssets(), which returns NAV-based
 * total value including liquid HYPE and NFT holdings valued via oracle-signed reports.
 * @param {object} api - DefiLlama chain API instance
 */
async function tvl(api) {
  for (const vault of Object.values(VAULTS)) {
    const totalAssets = await api.call({
      abi: "uint256:totalAssets",
      target: vault.address,
    });
    api.add(vault.asset, totalAssets);
  }
}

module.exports = {
  methodology:
    "TVL is calculated from each vault's totalAssets(), which returns the NAV-based total value including liquid HYPE and NFT holdings valued via oracle-signed NAV reports.",
  hyperliquid: {
    tvl,
  },
};
