const utils = require('../helper/utils');

function fetch() {
  return async () => {
    const response = await utils.fetchURL('https://swamp.finance/static/frontend/api-public/api-pools.json');

    let tvl = 0;

    for (vault in response) {
      tvl += chain[vault].tvl;
    }

    return tvl;
  }
}

module.exports = {
  fetch
}
