const axios = require('axios');
const { getEnv } = require('../helper/env');

const BASE_URL = 'https://base-api-public.mrgn.app';
const API_ENDPOINT = `${BASE_URL}/v1/bank/metrics`;
const startTime = new Date().toISOString();
const END_TIME = '9999-12-31T23:59:59.999Z';
const GROUP_ADDRESS = '4qp6Fx6tnZkY5Wropq9wUYgtFxXKwE6viZxFHg3rdAG8';

async function fetchAllBankMetrics() {
  const apiKey = getEnv('P0_API_KEY')
  const allData = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const { data: response } = await axios.get(API_ENDPOINT, {
      params: {
        start_time: startTime,
        end_time: END_TIME,
        group_address: GROUP_ADDRESS,
        page,
        page_size: 1000,
      },
      headers: {
        ...(apiKey && { 'x-api-key': apiKey }),
      },
    });

    if (!response.success || !Array.isArray(response.data)) {
      break;
    }

    allData.push(...response.data);

    const pagination = response.metadata?.pagination;
    hasNextPage = pagination?.has_next_page === true;
    if (hasNextPage) {
      page = (pagination?.current_page ?? page) + 1;
    }
  }

  return allData;
}

function toRawAmount(value, decimals) {
  if (value == null || value === 0) return 0;
  const d = decimals ?? 0;
  return Math.floor(Number(value) * (10 ** d));
}

async function tvl(api) {
  const metrics = await fetchAllBankMetrics();
  const availableLiquidityByMint = {};

  for (const row of metrics) {
    const mint = row.mint;
    if (!mint) continue;

    const deposits = toRawAmount(row.total_deposits, row.mint_decimals);
    const borrows = toRawAmount(row.total_borrows, row.mint_decimals);
    const availableLiquidity = Math.max(0, deposits - borrows);

    if (availableLiquidity > 0) {
      availableLiquidityByMint[mint] = (availableLiquidityByMint[mint] ?? 0) + availableLiquidity;
    }
  }

  for (const [mint, amount] of Object.entries(availableLiquidityByMint)) {
    if (amount > 0) {
      api.add(mint, amount.toString());
    }
  }

  return api.getBalances();
}

async function borrowed(api) {
  const metrics = await fetchAllBankMetrics();
  const borrowedByMint = {};

  for (const row of metrics) {
    const mint = row.mint;
    if (!mint) continue;

    const borrows = toRawAmount(row.total_borrows, row.mint_decimals);
    if (borrows > 0) {
      borrowedByMint[mint] = (borrowedByMint[mint] ?? 0) + borrows;
    }
  }

  for (const [mint, amount] of Object.entries(borrowedByMint)) {
    if (amount > 0) {
      api.add(mint, amount.toString());
    }
  }

  return api.getBalances();
}

module.exports = {
  doublecounted: true,
  solana: {
    tvl,
    borrowed
  },
  methodology: "TVL is calculated as available liquidity across all banks in the P0 program."
};
