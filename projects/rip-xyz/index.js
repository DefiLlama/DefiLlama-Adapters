const { sumTokens2 } = require("../helper/unwrapLPs");

const WHYPE = "0x5555555555555555555555555555555555555555";

const VAULTS = {
  rHYPURR: {
    address: "0x0Df4f69CF9417b1817AB9579bF099537a694667B",
    asset: WHYPE,
    lps: [
      {
        address: "0x1F6b7B53623B3039720a186b31Ef7f50F0E34420", // Project X
        pair: WHYPE, // WHYPE/rHYPURR
      },
    ],
  },
  // Future vaults added here
};

async function tvl(api) {
  for (const vault of Object.values(VAULTS)) {
    const totalAssets = await api.call({
      abi: "uint256:totalAssets",
      target: vault.address,
    });
    api.add(vault.asset, totalAssets);
  }
}

async function pool2(api) {
  for (const vault of Object.values(VAULTS)) {
    for (const lp of vault.lps ?? []) {
      await sumTokens2({
        api,
        owner: lp.address,
        tokens: [lp.pair, vault.address],
      });
    }
  }
}

module.exports = {
  methodology:
    "TVL is calculated from each vault's totalAssets(), which returns the NAV-based total value including liquid HYPE and NFT holdings valued via oracle-signed NAV reports. Pool2 tracks rHYPURR/WHYPE LP liquidity on Project X.",
  hyperliquid: {
    tvl,
    pool2,
  },
};
