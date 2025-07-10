const utils = require('../helper/utils');
const { toUSDTBalances } = require('../helper/balances');
let _response

function fetchChain(chainId) {
  return async () => {
    if (!_response) _response = utils.fetchURL('https://api-vaults.hyperbloom.xyz/tvl')
    const response = await _response;

    let tvl = 0;
    const chain = response.data[chainId];
    for (const vault in chain) {
      tvl += Number(chain[vault]);
    }

    return toUSDTBalances(tvl);
  }
}


module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  doublecounted: true,
  hyperliquid: {
    tvl: fetchChain(999)
  },
}