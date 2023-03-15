const http =  require('../helper/http')
// const bluemoveApi =  'https://aptos-mainnet-api.bluemove.net/api/market-info/tvl';
const bluemoveApi  = 'https://aptos-mainnet-api.bluemove.net/api/market-info/stake-tvl';
async function query(api) {
  return http.get(`${api}`)
}

module.exports = {
  timetravel: false,
  // methodology: "The total value locked is calculated by adding each value locked for each collection listed on the BlueMove NFT marketplace. The collection's value locked is calculated by the total NFT locked on the platform including listed and staked NFTs with the NFT collection floor price respectively",
  methodology: "The total value locked is the value of the $MOVE coin that was staked into the BlueMove platform.",
  aptos: {
    // tvl: async () => {
    //   const {tvl: { total_aptos } } = await query(bluemoveApi);
    //   return {
    //     aptos: total_aptos/1e8
    //   }
    // }
    tvl: () => 0
  }
}