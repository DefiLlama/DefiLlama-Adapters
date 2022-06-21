const retry = require('./helper/retry');
const axios = require('axios');

async function fetch() {
  const response = (
    await retry(
      async (bail) => await axios.get('https://data.goblin.gold:7766/metrics/tvl')
    )
  ).data;

  return response.totalTVL;
}

module.exports = {
  timetravel: false,
  methodology: "The GoblinGold API endpoint fetches on-chain data from the GoblinGold contracts and uses Coingecko prices to aggregate total TVL.",
  fetch,
};
