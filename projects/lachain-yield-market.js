const utils = require('./helper/utils');

async function fetch() {
    const response = await utils.fetchURL(`https://farms-info.lachain.io/farms/beefy`); 
    var tvl_sum = 0;

    for (let i = 0; i < response.data.length; i++) {
        const f = response.data[i];
        tvl_sum += parseFloat(f['lachainTvl']);
    };

    return tvl_sum;
}

module.exports = {
  lachain: { fetch },
  fetch,
}

