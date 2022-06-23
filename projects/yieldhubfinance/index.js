const utils = require('../helper/utils');
const { toUSDTBalances } = require('../helper/balances');

async function fetch() {
  const response = await utils.fetchURL('https://api.yieldhub.finance/tvl');
  let tvl = 0;
  for (const chainId in response.data) {
    const chain = response.data[chainId];
    for (const vault in chain) {
      tvl += chain[vault];
    }
  }
  return toUSDTBalances(tvl);
}

const chains = {
  telos: 40
}

module.exports = {
  timetravel: false,
  telos: {
    tvl: fetch
  },
}
