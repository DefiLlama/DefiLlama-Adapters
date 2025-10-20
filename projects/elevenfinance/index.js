const utils = require('../helper/utils');

const apiUrl = 'https://eleven.finance/api.json';

const excludedPools = {
  'polygon': [
    'ELE ',
    'ELE-MUST cLP',
    'ELE-QUICK qLP',
    'ELE-MATIC cLP',
    'ELE-MATIC qLP',
    'ELE-MATIC SLP',
    'ELE-MATIC WLP',
    'ELE-USDC DLP',
    'ELE-DFYN DLP',
  ],
  'fantom': [
    'ELE-WFTM SLP',
  ],
  'bsc': [
    'ELE',
    'ELE-BNB WLP',
    'ELE-BNB LP V2',
  ],
  'avax': [
    'ELE-WAVAX TLP',
    'ELE-WAVAX PLP',
    'ELE-PNG PLP',
    'ELE  ',
  ],
  'okexchain': [
    'ELE-USDT PLP',
  ],
};

const tvl = async (api) => {
  const { data } = await utils.fetchURL(apiUrl);
  let tvl = parseFloat(data.tvlinfo[api.chainId]);

  const poolsToExclude = excludedPools[api.chainId] || [];
  for (const pool of poolsToExclude) {
    const poolTVL = parseFloat(data[pool]?.tvl ?? 0);
    tvl -= poolTVL;
  }

  return api.addUSDValue(Math.round(tvl));
};

module.exports.misrepresentedTokens = true

const chains = ["bsc", "polygon", "fantom", "avax", "okexchain"]
chains.forEach((chain) => {
  module.exports[chain] = { tvl }
})