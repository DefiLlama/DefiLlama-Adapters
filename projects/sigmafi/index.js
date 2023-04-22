const utils = require('./helper/utils');
const { toUSDTBalances } = require('./helper/balances');

async function tvl() {
  const SigmaFiTVL = await utils.fetchURL('https://api.sigmaexplorer.org/sigmafi/tvl/summary');
  return toUSDTBalances(SigmaFiTVL);
}

module.exports = {
  misrepresentedTokens: false,
  tvl,
  methodology: 'SigmaFi TVL is achieved by making a call to its API: https://api.sigmaexplorer.org/sigmafi/tvl/summary API endpoint.',
};
