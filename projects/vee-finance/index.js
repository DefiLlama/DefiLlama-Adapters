const axios = require('axios');
const BN = require('bignumber.js');

async function fetch() {   
    var tvl = 0;
    try {
        
        var price_feed = await axios.get('https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=vee-finance');  
        var response   = await axios.get('https://cmc.vee.finance/circulating');
        if(response.status == 200 && price_feed.status == 200){
            tvl = new BN(response.data).multipliedBy(BN(price_feed.data['vee-finance'].usd)).toFixed(2);
        }
    } catch (error) {
       //console.error("tvl()-error: ===> " + JSON.stringify(error));
  }
  return tvl;    
}

module.exports = {
    fetch
}
