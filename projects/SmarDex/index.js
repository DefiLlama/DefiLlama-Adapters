const { fetchURL } = require('../helper/utils');

async function fetch() {
  const metrics = await fetchURL('https://api.smardex.io/ethereum/v0.1/pairs/metrics.json');
  return metrics.data.tvl.usd;
}

module.exports = {
  methodology: 'TVL of the liquidity on all AMM pools, and the SDEX Staking.',
  misrepresentedTokens: true,
  timetravel: false,
  ethereum: {
    fetch,
  },
  fetch,
}
