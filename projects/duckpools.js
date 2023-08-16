const axios = require("axios");

async function duckpoolsTVL(_, _b, _cb, { api }) {
  const { data } = await axios.get(
    "https://api.ergoplatform.com/api/v1/boxes/unspent/byTokenId/48fb42e0cca6e758f043abbf61cdf10328a5a43a71d3542602065c5ffaab86aa"
  );
  let totalTvl = data.items[0][value];

  return totalTvl;
}

module.exports = {
  timetravel: false,
  ergo: {
    tvl: duckpoolsTVL,
  },
};
