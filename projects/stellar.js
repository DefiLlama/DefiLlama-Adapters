const { get } = require('./helper/http')

async function fetch({ timestamp }) {
  if (!timestamp) {
    timestamp = Math.floor(Date.now() / 1000); // default to current time
  }

  const dateObj = new Date(timestamp * 1000);

  const targetDate = dateObj.toISOString().slice(0, 10); // 'YYYY-MM-DD'

  // The stellar-tvl.json is newline delimited
  const response = await get(
    "https://storage.googleapis.com/defillama-stellar-tvl/stellar-tvl.json",
    { responseType: 'text' }
  );

  const lines = response.trim().split('\n');
  const parsed = lines.map(line => JSON.parse(line));
 
  const match = parsed.find(entry => entry.day === targetDate);

  return match.total_tvl_usd
}

module.exports = {
  timetravel: true,
  start: 1704067200, // 2025-01-01 UTC
  methodology: 'Value of total selling liabilities in accounts and trustlines for the Stellar network converted to USD',
  fetch,
};
