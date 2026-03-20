const utils = require('../helper/utils');
const { getApiTvl } = require('../helper/historicalApi');

const TVL_URL = "https://storage.googleapis.com/defillama-stellar-tvl/stellar-tvl.json";

async function fetchTvlData() {
  const response = await utils.fetchURL(TVL_URL, { responseType: 'text' });
  const lines = response.data.trim().split('\n');
  return lines.map(line => JSON.parse(line));
}

async function current() {
  const parsed = await fetchTvlData()
  
  const latest = parsed.reduce((a, b) => (a.day > b.day ? a : b));
  if (latest.total_tvl_usd > 1e8) throw new Error('Value too high: '+ latest.total_tvl_usd)
  return latest.total_tvl_usd;
}

function tvl(timestamp) {
  return getApiTvl(timestamp, current, async () => {
    const parsed = await fetchTvlData()
    
    return parsed.map(entry => ({
      date: Math.round(new Date(entry.day).getTime() / 1e3),
      totalLiquidityUSD: entry.total_tvl_usd,
    }));
  });
}

module.exports = {
  methodology: 'Total value of all sell offers in the built-in Stellar Decentralized exchange. This includes XLM and assets issued on the network, converting to USD.',
  stellar: { tvl },
  timetravel: true,
  misrepresentedTokens: true,
  start: 1659916800, // 2022-08-08 UTC
};
