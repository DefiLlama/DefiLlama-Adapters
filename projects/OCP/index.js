const utils = require("../helper/utils");

function fetchChain(chainId) {
  return async () => {
    const response = await utils.fetchURL(
      "https://api-omnisteaks.ocp.finance/tvl/apps?q=1666600000"
    );

    let tvl = 0;
    const tradeTvl = response.data["tradeTvl"];
    const compTvl = response.data["compTvl"];
    const vaultTvl = response.data["vaultTvl"];
    const steakTvl = response.data["steakTvl"];
    const farmTvl = response.data["farmTvl"];

    tvl =
      Number(tradeTvl) +
      Number(compTvl) +
      Number(vaultTvl) +
      Number(steakTvl) +
      Number(farmTvl);
    if (tvl === 0) {
      throw new Error(`chain ${chainId} tvl is 0`);
    }
    return tvl;
  };
}

async function fetch() {
  const response = await utils.fetchURL(
    "https://api-omnisteaks.ocp.finance/tvl/apps?q=1666600000"
  );

  let tvl = 0;
  tvl = response.data["totalTvl"];
  if (tvl === 0) {
    throw new Error("tvl is 0");
  }

  return tvl;
}

module.exports = {
  bsc: {
    fetch: fetchChain(56),
  },
  fetch,
};
