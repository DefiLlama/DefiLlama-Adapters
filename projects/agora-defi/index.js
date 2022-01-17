const utils = require("../helper/utils");

function fetchChain(chainId) {
  return async () => {
    const {data} = await utils.fetchURL(
      "https://api.agoradefi.io/api/tvl/apps"
    );

    let tvl = 0;
    tvl = data.data["totalTvl"];

    if (tvl === 0) {
      throw new Error(`chain ${chainId} tvl is 0`);
    }
    return tvl;
  };
}

async function fetch() {
  const {data} = await utils.fetchURL(
    "https://api.agoradefi.io/api/tvl/apps"
  );

  let tvl = 0;
  tvl = data.data["totalTvl"];
  if (tvl === 0) {
    throw new Error("tvl is 0");
  }

  return tvl;
}

module.exports = {
  'metis': {
    fetch: fetchChain(1088),
  },
  fetch,
};
