const axios = require("axios");
const retry = require('async-retry')

const getEthPrice = () => {
  return retry(async (bail) => {
    const {data} = await axios.get("https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=ethereum");
    return data.ethereum.usd;
  })
}

 function fetchTVL(name) {
   return async function() {
    const pools = (await retry(async bail => await axios.get(`https://${name}.market.xyz/api/getAllPools`))).data;
    const tvl = await getEthPrice() * (pools["2"].reduce((total, poolSupply) => total + parseInt(poolSupply), 0)/1e18);
    return tvl;
   }
}

module.exports = {
  fantom: {
    fetch: fetchTVL("fantom")
  },
  polygon: {
    fetch: fetchTVL("polygon")
  },
  fetch: async () => (await fetchTVL("fantom")()) + (await fetchTVL("polygon")()),
}