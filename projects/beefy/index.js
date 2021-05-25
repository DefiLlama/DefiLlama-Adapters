const utils = require('./helper/utils');

async function fetch() {
  const response = await utils.fetchURL('https://api.beefy.finance/tvl');
  
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
  fetch
}
