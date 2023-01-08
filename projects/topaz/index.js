const http =  require('../helper/http')
const topaz_api =  'https://api-v1.topaz.so/api/stats/tvl';
async function query(api) {
  return http.get(`${api}`)
}

module.exports = {
  timetravel: false,
  methodology: "The total value locked is calculated by adding up the value locked for each collection listed on the Topaz NFT marketplace. The collection's value locked is calculated by the total # of NFTs in escrow on the platform multiplied by the NFT collection's current floor price.",
  aptos: {
    tvl: async () => {
      const {data } = await query(topaz_api);
      return {
        aptos: data/1e8
      }
    }
  }
}
