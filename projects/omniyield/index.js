const { getConfig } = require("../helper/cache");

const ENDPOINT = "https://api.omniyield.finance/pools";

async function tvl(api) {
  const pools = await getConfig("omniyield/arbitrum", ENDPOINT);
  const arbitrumPools = pools["42161"] || [];

  if (!arbitrumPools.length) {
    return {};
  }

  for (const pool of arbitrumPools) {
    const poolAddress = pool.address;
    const assetAddress = pool.asset.address;

    if (!poolAddress || !assetAddress) {
      continue;
    }

    const totalValue = await api.call({
      abi: "uint256:totalValue",
      target: poolAddress,
    });

    api.add(assetAddress, totalValue);
  }
}

module.exports = {
  methodology:
    "TVL is calculated by summing the total value of assets locked in all pools.",
  arbitrum: { tvl },
};