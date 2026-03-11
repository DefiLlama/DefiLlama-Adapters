const BigNumber = require('bignumber.js');
const { get } = require('../helper/http');

const NEONY_TVL_ENDPOINT = 'https://api.mainnet.neony.exchange/v1/get_exchange_stats_history';

function getDayRangeMs(timestamp) {
  const dayStart = Math.floor(timestamp / 86400) * 86400;

  return {
    olderTimestampMs: dayStart * 1000,
    newerTimestampMs: (dayStart + 86400) * 1000 - 1,
  };
}

function toBigNumber(value, field) {
  const parsed = new BigNumber(value);
  if (!parsed.isFinite() || parsed.isNegative()) {
    throw new Error(`Neony TVL API returned invalid ${field}: ${value}`);
  }

  return parsed;
}

async function tvl(api) {
  const { olderTimestampMs, newerTimestampMs } = getDayRangeMs(api.timestamp);
  const query = new URLSearchParams({
    olderTimestampMs: String(olderTimestampMs),
    newerTimestampMs: String(newerTimestampMs),
  });
  const response = await get(`${NEONY_TVL_ENDPOINT}?${query.toString()}`);
  const entries = response?.data;

  if (!Array.isArray(entries)) {
    throw new Error('Neony TVL API returned invalid data array');
  }

  const matchingEntries = entries.filter((entry) =>
    entry
    && String(entry.timestampOpen) === String(olderTimestampMs)
    && String(entry.timestampClose) === String(newerTimestampMs)
  );

  if (matchingEntries.length !== 1) {
    throw new Error(
      `Neony TVL API returned ${matchingEntries.length} rows for ${olderTimestampMs}-${newerTimestampMs}`
    );
  }

  const [entry] = matchingEntries;
  if (!Array.isArray(entry.tvlBreakdown)) {
    throw new Error('Neony TVL API returned invalid tvlBreakdown');
  }

  const tvlUsd = entry.tvlBreakdown.reduce((total, token) => {
    if (!token || token.valueUsd === undefined || token.valueUsd === null) {
      throw new Error('Neony TVL API returned invalid tvlBreakdown valueUsd');
    }

    return total.plus(toBigNumber(token.valueUsd, 'tvlBreakdown.valueUsd'));
  }, new BigNumber(0));

  return { 'usd-coin': Number(tvlUsd.toString()) };
}

module.exports = {
  methodology: 'Total value of all coins held in the protocol',
  timetravel: true,
  start: '2026-03-05',
  neony: { tvl },
};
