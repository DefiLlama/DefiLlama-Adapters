const utils = require("../helper/utils");

function fetchChain(chainId) {
  return async () => {
    const response = await utils.fetchURL(
      "https://api-opendao.opendao.io/api/tvl/apps"
    );

    let tvl = 0;
    tvl = response.data.data["totalTvl"];

    if (tvl === 0) {
      throw new Error(`chain ${chainId} tvl is 0`);
    }
    return tvl;
  };
}

async function fetch() {
  const response = await utils.fetchURL(
    "https://api-opendao.opendao.io/api/tvl/apps"
  );

  let tvl = 0;
  tvl = response.data.data["totalTvl"];

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
