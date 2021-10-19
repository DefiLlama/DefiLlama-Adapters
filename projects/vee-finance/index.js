const axios = require('axios');
const BN = require('bignumber.js');

async function fetch() {   
    var tvl = 0;
    try {
        var responseV1   = await axios.get('https://api-prod.vee.finance/getv1tvl');
        var responseV2   = await axios.get('https://api-prod.vee.finance/getv2tvl');
        
        if(responseV1.status == 200 && responseV2.status == 200){            
            tvl = new BN(responseV1.data.data['tvl']).plus(responseV2.data.data['tvl']).toFixed(2);           
        }
    } catch (error) {
       //console.error("tvl()-error: ===> " + error);
  }
  return tvl;    
}

module.exports = {
    fetch
}