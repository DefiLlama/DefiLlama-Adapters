const { fetchURL } = require("../helper/utils");

async function tvl(timestamp, block) {
  const url = "https://api.adapters.neptunemutual.com/defillama/ethereum/tvl";
  const { data } = await fetchURL(url);

  return data;
}

module.exports = {
  timetravel: false,
  methodology: "TVL consists of the total liquidity available in the cover pools",
  start: 1667260800, // Nov 01 2022 @ 12:00am (UTC)
  ethereum: { tvl },
};
