const utils = require('../helper/utils');

async function fetch() {
    const response = await utils.fetchURL('https://api.sleepearn.finance/tvl');
    let tvl = 0;
    for (const vault in response.data[0]) {
        tvl += response.data[0][vault];
    }
    return tvl;
}

module.exports = {
  kardia:{
    fetch
  },
  fetch
};