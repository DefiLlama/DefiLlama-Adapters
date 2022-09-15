const utils = require('../helper/utils');
const {toUSDTBalances} = require('../helper/balances');

const chains = {
  ethereum: 1,
  arbitrum: 42161,
  avax: 43114,
}

function getChainBalance(chainId, resp) {
  return async () => {

    const data = (await resp).data;

    const tvl = data
      .filter(item => item.chainId === chainId)
      .map(item => item.tvl)
      .reduce((prev, curr) => prev + curr, 0);

    return toUSDTBalances(tvl);
  }
}

function getData() {

  const data = utils.fetchURL('http://api.shipyard.finance/vaults');

  return Object.fromEntries(Object.entries(chains).map(chain =>
    [chain[0], {
      tvl: getChainBalance(chain[1], data),
    }]));
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  doublecounted: true,
  ...(getData())
}
