const utils = require('../helper/utils');

function fetchChain(chainId) {
  return async () => {
    const response = await utils.fetchURL('https://api.grim.finance/tvl');

    let tvl = 0;
    const chain = response.data[chainId];
    for (vault in chain) {
      tvl += chain[vault];
    }

    return tvl;
  }
}


async function fetch() {
  const response = await utils.fetchURL('https://api.grim.finance/tvl');

  let tvl = 0;
  for (chainId in response.data) {
    const chain = response.data[chainId];

    for (vault in chain) {
      tvl += chain[vault];
    }
  }

  return tvl;
}

module.exports = {
  fantom:{
    fetch: fetchChain(250)
  },
  fetch
}
