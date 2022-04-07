const utils = require('../helper/utils');
const { toUSDTBalances } = require('../helper/balances');

function fetch() {
  return async () => {
      const response = await utils.fetchURL('https://api.yieldhub.finance/tvl');
      let tvl = 0;
      for (chainId in response.data) {
        const chain = response.data[chainId];
        for (vault in chain) {
          tvl += chain[vault];
        } 
      }
      return toUSDTBalances(tvl);
    }
}

const chains = {
  telos:40
}

module.exports = {
  timetravel: false,
  telos: {
      tvl: fetch()
  },
}
