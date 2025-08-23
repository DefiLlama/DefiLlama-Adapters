const { post } = require('../helper/http');
const sdk = require('@defillama/sdk');

const tokenMapping = {
  'xtokens:XBTC': 'bitcoin',
  'xtokens:XLTC': 'litecoin',
  'xtokens:XETH': 'ethereum',
  'xtokens:XXRP': 'ripple',
  'eosio.token:XPR': 'proton',
  'xtokens:XMT': 'metal',
  'xtokens:XUST': 'terrausd-wormhole',   // optional/legacy
  'xtokens:XLUNA': 'terra-luna-2',       // optional/legacy
  'xtokens:XUSDC': 'usd-coin',
  'xtokens:XDOGE': 'dogecoin',
  'xtokens:XUSDT': 'tether',
};

const API_ENDPOINT = 'https://proton.eosusa.io';
const LENDING_CONTRACT = 'lending.loan';

function parseAsset(assetString) {
  if (!assetString) return { amount: 0, symbol: '' };
  const [amount, symbol] = assetString.split(' ');
  return { amount: parseFloat(amount), symbol };
}

async function fetchMarkets() {
  const res = await post(`${API_ENDPOINT}/v1/chain/get_table_rows`, {
    code: LENDING_CONTRACT,
    scope: LENDING_CONTRACT,
    table: 'markets',
    limit: 100,
    json: true,
  });
  return res.rows || [];
}

async function fetchLiquidity(tokenContract, symbol) {
  const res = await post(`${API_ENDPOINT}/v1/chain/get_table_rows`, {
    code: tokenContract,
    scope: LENDING_CONTRACT,
    table: 'accounts',
    limit: 100,
    json: true,
  });
  const rows = res.rows || [];
  const tokenBalance = rows.find(b => parseAsset(b.balance).symbol === symbol);
  return tokenBalance ? parseAsset(tokenBalance.balance).amount : 0;
}

// ----------------------------
// TVL = borrows + cash reserves
// ----------------------------
async function tvl() {
  const balances = {};
  const markets = await fetchMarkets();

  const promises = markets.map(async (market) => {
    const totalVar = parseAsset(market.total_variable_borrows.quantity).amount;
    const totalStable = parseAsset(market.total_stable_borrows.quantity).amount;
    const totalBorrows = totalVar + totalStable;

    const [ , symbol ] = market.underlying_symbol.sym.split(',');
    const tokenContract = market.underlying_symbol.contract;

    // liquidity available in lending contract
    const cashAvailable = await fetchLiquidity(tokenContract, symbol);
    const totalSupplied = totalBorrows + cashAvailable;

    const internalId = `${tokenContract}:${symbol}`;
    const cgkId = tokenMapping[internalId];
    if (!cgkId) return;

    sdk.util.sumSingleBalance(balances, `coingecko:${cgkId}`, totalSupplied);
  });

  await Promise.all(promises);
  return balances;
}

// ----------------------------
// Borrowed = borrows only
// ----------------------------
async function borrowed() {
  const balances = {};
  const markets = await fetchMarkets();

  markets.forEach(market => {
    const totalVar = parseAsset(market.total_variable_borrows.quantity).amount;
    const totalStable = parseAsset(market.total_stable_borrows.quantity).amount;
    const totalBorrows = totalVar + totalStable;

    const [ , symbol ] = market.underlying_symbol.sym.split(',');
    const tokenContract = market.underlying_symbol.contract;
    const internalId = `${tokenContract}:${symbol}`;
    const cgkId = tokenMapping[internalId];
    if (!cgkId) return;

    sdk.util.sumSingleBalance(balances, `coingecko:${cgkId}`, totalBorrows);
  });

  return balances;
}

module.exports = {
  methodology: 'TVL = variable borrows + stable borrows + available liquidity in lending.loan. Borrowed = total outstanding borrows (variable + stable). Mapping is to CoinGecko IDs.',
  proton: {
    tvl,
    borrowed,
  }
};