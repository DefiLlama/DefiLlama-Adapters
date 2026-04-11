const VAULTS = {
  berachain: [
    {
      vault: "0x3B4d6c8C73962218724ea140Ad7c7CD13dCF165E",
      lp: "0x4a254B11810B8EBb63C5468E438FC561Cb1bB1da",
    },
  ],
};

async function tvl(api) {
  for (const v of VAULTS[api.chain] || []) {
    const totalAssets = await api.call({
      abi: "function totalAssets() view returns (uint256)",
      target: v.vault,
    });
    api.add(v.lp, totalAssets);
  }
}

module.exports = {
  methodology: "TVL is LP tokens in Mycelium auto-compound vaults, staked in Infrared Gauges on Berachain. 1% fee, auto-compounds every 30 min.",
  berachain: { tvl },
};
