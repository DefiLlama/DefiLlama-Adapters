const utils = require('../helper/utils');

function fetchChain(chainId) {
  return async () => {
    const response = await utils.fetchURL('https://api.beefy.finance/tvl');

    let tvl = 0;
    const chain = response.data[chainId];
    for (vault in chain) {
      tvl += chain[vault];
    }
    if(tvl === 0){
      throw new Error("tvl is 0")
    }

    return tvl;
  }
}


async function fetch() {
  const response = await utils.fetchURL('https://api.beefy.finance/tvl');

  let tvl = 0;
  for (chainId in response.data) {
    const chain = response.data[chainId];

    for (vault in chain) {
      tvl += chain[vault];
    }
  }
  if(tvl === 0){
    throw new Error("tvl is 0")
  }

  return tvl;
}

module.exports = {
  bsc:{
    fetch: fetchChain(56)
  },
  heco:{
    fetch: fetchChain(128)
  },
  polygon:{
    fetch: fetchChain(137)
  },
  fantom:{
    fetch: fetchChain(250)
  },
  avalanche:{
    fetch: fetchChain(43114)
  },
  fetch
}
