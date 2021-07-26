const utils = require("../helper/utils");

async function fetchEth() {
  const { data: totalTvl } = await utils.fetchURL(
    "https://v2-api.yai.finance/v1/total-value-locked"
  );
  return totalTvl.data[2]?.value;
}

async function fetchBsc() {
  const { data: totalTvl } = await utils.fetchURL(
    "https://v2-api.yai.finance/v1/total-value-locked"
  );
  return totalTvl.data[1].value;
}

async function fetch() {
  const { data: totalTvl } = await utils.fetchURL(
    "https://v2-api.yai.finance/v1/total-value-locked"
  );
  return totalTvl.data[1].value + totalTvl.data[2].value;
}

module.exports = {
  ethereum: {
    fetch: fetchEth,
  },
  bsc: {
    fetch: fetchBsc,
  },
  fetch,
};
