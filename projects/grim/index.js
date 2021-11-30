const utils = require('../helper/utils');
var chainId;
var vault;


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
  methodology: 'TVL data is pulled from the Grim Finance API "https://api.grim.finance/tvl".',
  fetch,

}
