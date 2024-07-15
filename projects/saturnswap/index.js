const { fetchURL } = require("../helper/utils")

async function tvl() {
  const res = await fetchURL("https://api.saturnswap.io/v1/defillama/tvl");
  return {
      cardano: res.data.tvl.tvl
  };
}

module.exports = {
    timetravel: false,
    cardano: {
        tvl
    }
}
