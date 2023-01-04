const http =  require('../helper/http')
const bluemoveApi =  'https://aptos-mainnet-api.bluemove.net/api/market-info/tvl';
async function query(api) {
  return http.get(`${api}`)
}

module.exports = {
  timetravel: false,
  aptos: {
    tvl: async () => {
      const {tvl: { total_aptos } } = await query(bluemoveApi);
      return {
        aptos: total_aptos/1e8
      }
    }
  }
}