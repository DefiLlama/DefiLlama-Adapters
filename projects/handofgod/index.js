const axios = require('axios');

module.exports = {
  methodology: "TVL is fetched directly from the Hand of God API. It counts the deposits on Elysium (Genesis & Farms), and the GHOG staked on Sanctum.",
  sonic: {
    tvl: async () => {
      const response = await axios.get('https://handofgod.app/api/tvl');
      return {
        'comdex': response.data.tvl
      };
    },
  },
};