const { BigQuery } = require('@google-cloud/bigquery');
const { getApiTvl } = require('../helper/historicalApi');

const bigquery = new BigQuery();

async function fetchTvlData() {
  const [rows] = await bigquery.query(`
    SELECT
      DATE_TRUNC(day, DAY) AS day,
      total_tvl_usd
    FROM \`crypto-stellar.crypto_stellar_dbt.tvl_agg\`
    ORDER BY day
  `);

  return rows.map(row => ({
    day: row.day.value || row.day,
    total_tvl_usd: parseFloat(row.total_tvl_usd),
  }));
}

async function current() {
  const parsed = await fetchTvlData();
  const latest = parsed.reduce((a, b) => (a.day > b.day ? a : b));
  return latest.total_tvl_usd;
}

function tvl(timestamp) {
  return getApiTvl(timestamp, current, async () => {
    const parsed = await fetchTvlData();
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
  start: 1659916800, // 2022-08-08 UTC
};

