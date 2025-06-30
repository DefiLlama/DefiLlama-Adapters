const { fetch } = require('cross-fetch');

module.exports = {
  timetravel: false,
  start: 1751001480,
  methodology: 'TVL is fetched from our offchain API which aggregates on-chain balances on Tron.',
  tron: {
    tvl: async () => {
      const res = await fetch('https://usdtf-tvl-production.up.railway.app/api/tvl');
      const { tvl } = await res.json();
      return { tether: tvl }; // Custom label instead of "tether"
    },
  },
};
