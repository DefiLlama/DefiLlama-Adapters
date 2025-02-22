const utils = require('./helper/utils');
const { deadFrom } = require('./ladex-exchange');

async function fetch() {
    const response = await utils.fetchURL(`https://farms-info.lachain.io/farms/beefy`); 
    const response_ladex = await utils.fetchURL(`https://farms-info.lachain.io/farms/ladex`); 
    
    var tvl_sum = 0;

    for (let i = 0; i < response.data.length; i++) {
        const f = response.data[i];
        tvl_sum += parseFloat(f['lachainTvl']);
    }

    for (let i = 0; i < response_ladex.data.length; i++) {
      const f = response_ladex.data[i];
      tvl_sum += parseFloat(f['lachainTvl']);
  }

    return tvl_sum;
}

module.exports = {
  deadFrom: '2024-01-01',
  lachain: { fetch },
  fetch,
}

