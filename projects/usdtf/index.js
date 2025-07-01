const { fetch } = require('cross-fetch');

module.exports = {
  timetravel: false,
  start: 1751001480, // June 27, 2025 @ 05:18:00 UTC
  methodology: 'TVL is fetched from our own offchain API which aggregates on-chain balances.',
  tron: {
    tvl: async () => {
      const response = await fetch('https://usdtf-tvl-production.up.railway.app/api/tvl');
      const { tvl } = await response.json();
      return { tether: tvl }; // assuming your API returns value in USDT
    },
  },
};
