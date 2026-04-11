const WBERA_HONEY_VAULT = "0x3B4d6c8C73962218724ea140Ad7c7CD13dCF165E";
const WBERA_HONEY_LP = "0x4a254B11810B8EBb63C5468E438FC561Cb1bB1da";

async function berachainTvl(api) {
  const assets = await api.call({ abi: "uint256:totalAssets", target: WBERA_HONEY_VAULT });
  api.add(WBERA_HONEY_LP, assets);
}

module.exports = {
  doublecounted: true,
  methodology: "TVL counts LP tokens held by Mycelium vaults and staked in Infrared gauges.",
  berachain: { tvl: berachainTvl },
};
