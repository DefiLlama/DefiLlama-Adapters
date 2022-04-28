const utils = require('../helper/utils');
const { toUSDTBalances } = require('../helper/balances');
const STATS_URL = 'https://api.nordfinance.io/tvl/statistics';

function core(chain) {
  return async () => {
    var totalTvl = await utils.fetchURL(STATS_URL);
    return toUSDTBalances(
      totalTvl.data.tvl[chain] 
      - totalTvl.data.tvl.lpStaking[chain] 
      - totalTvl.data.tvl.staking[chain]
      );
  };
};

function pool2(chain) {
  return async () => {
    var totalTvl = await utils.fetchURL(STATS_URL);
    return toUSDTBalances(totalTvl.data.tvl.lpStaking[chain]);
  };
};

function staking(chain) {
  return async () => {
    var totalTvl = await utils.fetchURL(STATS_URL);
    return toUSDTBalances(totalTvl.data.tvl.staking[chain]);
  };
};

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  methodology: `TVL is obtained by making calls to the Nord Finance API "https://api.nordfinance.io/tvl/statistics".`,
  ethereum: {
    tvl: core('ethereum'),
    staking: staking('ethereum'),
    pool2: pool2('ethereum')
  },
  avalanche: {
    tvl: core('avalanche'),
    staking: staking('avalanche'),
    pool2: pool2('avalanche')
  },
  polygon: {
    tvl: core('polygon'),
    staking: staking('polygon'),
    pool2: pool2('polygon')
  }
};