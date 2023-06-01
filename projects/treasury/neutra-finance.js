async function tvl(_, _b, _cb, { api }) {
  const nGlpVaults = "0x6Bfa4F1DfAfeb9c37E4E8d436E1d0C5973E47e25";
  const nUSDCVault = "0x2a958665bC9A1680135241133569C7014230Cb21";

  const nGlpTotalValue = await api.call({
    abi: "uint256:totalValue",
    target: nGlpVaults,
  });
  const nUSDCTotalValue = await api.call({
    abi: "uint256:totalAssets",
    target: nUSDCVault,
  });

  const tvl = nUSDCTotalValue + (nGlpTotalValue / 1e24).toFixed();

  return tvl; // tvl in 6 decimal
}
module.exports = {
  arbitrum: {
    tvl,
  },
};
