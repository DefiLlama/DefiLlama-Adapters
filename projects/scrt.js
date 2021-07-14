const utils = require('./helper/utils.js');

async function fetch() {
    var data = await utils.fetchURL('https://api-bridge-mainnet.azurewebsites.net/tokens/?page=0&size=1000')
    
    let tvl  = 0;
    for (const p of data.data.tokens) {
      if(p.src_coin !== "UNILP-WSCRT-ETH" && p.src_coin !== "WSCRT"){
        tvl += parseFloat(p.totalLockedUSD)
      }
    }
    
    var data_bsc = await utils.fetchURL('https://bridge-bsc-mainnet.azurewebsites.net/tokens/?page=0&size=1000')
    
    for (const q of data_bsc.data.tokens) {
      if(q.src_coin !== "WSCRT"){
        tvl += parseFloat(q.totalLockedUSD)
      }
    }

    return tvl;
}

module.exports = {
    fetch
}
