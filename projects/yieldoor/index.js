const utils = require('../helper/utils');
const { toUSDTBalances } = require('../helper/balances');
let _response

const distressedAssets = ['aleth']; // Add any distressed asset names here

function fetchChain(chainId) {
  return async () => {
    if (!_response) _response = utils.fetchURL('https://api.yieldoor.com/platform-tvl')
    const response = await _response;

    let tvl = 0;
    const chain = response.data.chains[chainId];
    tvl += Number(chain.tvl);

    return toUSDTBalances(tvl);
  }
}

const chains = {
  base: 8453,
  sonic: 146,
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  doublecounted: true,
  ...Object.fromEntries(Object.entries(chains).map(chain => [chain[0], {
    tvl: fetchChain(chain[1], false),
  }]))
}
