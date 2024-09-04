const axios = require('axios');

const vaultAddress = '0x5401b8620E5FB570064CA9114fd1e135fd77D57c';

async function fetchTVL() {
  const response = await axios.get(`https://api.sevenseas.capital/hourlyData/ethereum/${vaultAddress}/1725321600/latest`);
  const latestData = response.data.Response[0];
  return parseFloat(latestData.tvl);
}
    
module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: async () => {
      const tvl = await fetchTVL();
      return {
        'usd': tvl
      };
    },
  },
}