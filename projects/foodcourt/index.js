const utils = require("../helper/utils");

const tvlUrl = "https://api.foodcourt.finance/v2/tvl?chain=";

function fetchChain(chain) {
  return async () => {
    const response = await utils.fetchURL(tvlUrl + chain);

    let tvl =
      Number(response.data.total_tvl) / 10 ** Number(response.data.decimal);
    if (tvl === 0) {
      throw new Error(`chain ${chain} tvl is 0`);
    }

    return tvl;
  };
}

async function fetch() {
  let tvl = (await fetchChain("56")()) + (await fetchChain("55555")());
  if (tvl === 0) {
    throw new Error("tvl is 0");
  }

  return tvl;
}

module.exports = {
  doublecounted: true,
  timetravel: false,
  misrepresentedTokens: true,
  bsc: {
    fetch: fetchChain("56"),
  },
  rei: {
    fetch: fetchChain("55555"),
  },
  fetch,
};
