const { fetchURL } = require('./helper/utils');
const { toUSDTBalances } = require('./helper/balances');

const CHAINS = [
  {
    name: 'bsc',
    id: 56,
  },
];

const ENDPOINT = 'https://app.rehold.io/api/v1/stats';

function decorator(chainId) {
  return async function tvl() {
    const url = `${ENDPOINT}?chainId=${chainId}`;
    const stats = await fetchURL(url);

    return toUSDTBalances(stats.data.tvl);
  }
}

module.exports = {
  timetravel: false,

  ...CHAINS.reduce((acc, item) => {
    acc[item.name] = {
      tvl: decorator(item.id),
    };

    return acc;
  }, {}),
};
