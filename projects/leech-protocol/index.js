const utils = require('../helper/utils');
const { toUSDTBalances } = require('../helper/balances');
let _response

function fetchChains(chainId) {
  return async () => {
    try {
      if (!_response) _response = utils.fetchURL('https://pc.leechprotocol.com/chains-tvl')
      const { data } = await _response;

      return toUSDTBalances(data[chainId])
    } catch (e) {
      return toUSDTBalances(0)
    }

  }
}

const chains = {
  optimism: 10,
  bsc: 56,
  avax: 43114,
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  doublecounted: true,
  ...Object.fromEntries(Object.entries(chains).map(chain => [chain[0], {
    tvl: fetchChains(chain[1]),
  }]))
}
