const utils = require('./helper/utils');


async function fetch() {
    var deposits = await utils.fetchURL('https://sodaki.com/api/last-tvl')
    let tvl  = 0;
    for (let datas of deposits.data) {
            
      tvl += parseFloat(datas.TLV * datas.price)
    }
    
    return tvl;
  }
  
  

  module.exports = {
    fetch
  }