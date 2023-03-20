const { fetchURL } = require('../helper/utils');

async function fetch() {
  const metrics = await fetchURL('https://api.smardex.io/ethereum/v0.1/pairs/metrics.json');
  return metrics.data.tvl.usd;
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ethereum: {
    fetch,
  },
  fetch,
}
