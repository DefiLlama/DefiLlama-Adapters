const utils = require('../helper/utils');

async function fetch() {
  const response = await utils.fetchURL('https://api.grim.finance/tvl');

  let tvl = 0;
  for (const chainId in response.data) {
    const chain = response.data[chainId];

    for (const vault in chain) {
      tvl += chain[vault];
    }
  }
  if(tvl === 0){
    throw new Error("TVL for grim finance cannot be 0")
  }

  return tvl;
}

module.exports = {
  hallmarks: [
    [1639785600, "Reentrancy attack"]
],
  timetravel: false,
  methodology: 'TVL data is pulled from the Grim Finance API "https://api.grim.finance/tvl".',
  fetch,
}
