const utils = require('./helper/utils.js');

async function fetch() {
    var data = await utils.fetchURL('https://api-bridge-mainnet.azurewebsites.net/tokens/?page=0&size=1000')
    
    let tvl  = 0;
    for (const p of data.data.tokens) {
      tvl += parseFloat(p.totalLockedUSD)
    }

    return tvl;
}

module.exports = {
    fetch
}
