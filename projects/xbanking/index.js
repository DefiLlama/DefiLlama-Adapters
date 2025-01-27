const utils = require('../helper/utils');
let _response;

function fetchChain(chainId, staking) {
  return async () => {
    if (!_response) {
      _response = utils.fetchURL('https://api.xbanking.org/v2/platform/tvl');
    }
    const response = await _response;
    let tvl = 0;

    const chainName = Object.keys(response).find(key => key.toLowerCase() === chainId.toLowerCase());
    
    if (chainName) {
      tvl = Number(response[chainName]);
    }

    if (tvl === 0) {
      throw new Error(`chain ${chainId} tvl is 0`);
    }
    return tvl;
  };
}

const chains = {
  ethereum: 'ethereum',
  avax: 'avax',
  arbitrum: 'arbitrum',
  binance: 'binance',
  solana: 'solana',
  bitcoin: 'bitcoin',
  ton: 'ton',
  aptos: 'aptos',
  sui: 'sui'
};

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  doublecounted: true,
  ...Object.fromEntries(Object.entries(chains).map(chain => [chain[0], {
    tvl: fetchChain(chain[1], false),
    staking: fetchChain(chain[1], true),
  }]))
};
