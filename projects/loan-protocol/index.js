const { post } = require('../helper/http');
const sdk = require('@defillama/sdk');

const tokenMapping = {
  'xtokens:XBTC': 'bitcoin',
  'xtokens:XLTC': 'litecoin',
  'xtokens:XETH': 'ethereum',
  'xtokens:XXRP': 'ripple',
  'eosio.token:XPR': 'proton',
  'xtokens:XMT': 'metal',
  'xtokens:XUST': 'terrausd-wormhole',
  'xtokens:XLUNA': 'terra-luna-2',
  'xtokens:XUSDC': 'usd-coin',
  'xtokens:XDOGE': 'dogecoin',
  'xtokens:XUSDT': 'tether',
};

const API_ENDPOINT = 'https://proton.eosusa.io';
const LENDING_CONTRACT = 'lending.loan';

function parseAsset(assetString) {
  if (!assetString) return { amount: 0, symbol: '' };
  const [amount, symbol] = assetString.split(' ');
  return {
    amount: parseFloat(amount),
    symbol,
  };
}

async function fetchMetrics() {
  const { rows: markets } = await post(`${API_ENDPOINT}/v1/chain/get_table_rows`, {
    json: true,
    code: LENDING_CONTRACT,
    scope: LENDING_CONTRACT,
    table: 'markets',
    limit: 100,
  });

  const promises = markets.map(async (market) => {
    const totalVariableBorrows = parseAsset(market.total_variable_borrows.quantity).amount;
    const totalStableBorrows = parseAsset(market.total_stable_borrows.quantity).amount;
    const borrowedAmount = totalVariableBorrows + totalStableBorrows;

    const underlyingToken = market.underlying_symbol;
    const tokenContract = underlyingToken.contract;
    const [, symbol] = underlyingToken.sym.split(',');

    const { rows: balancesData } = await post(`${API_ENDPOINT}/v1/chain/get_table_rows`, {
      json: true,
      code: tokenContract,
      scope: LENDING_CONTRACT,
      table: 'accounts',
      limit: 100,
    });

    const tokenBalance = balancesData.find(b => parseAsset(b.balance).symbol === symbol);
    const availableAmount = tokenBalance ? parseAsset(tokenBalance.balance).amount : 0;
    const internalTokenId = `${tokenContract}:${symbol}`;
    const finalTokenId = tokenMapping[internalTokenId];

    return {
      tokenId: finalTokenId,
      borrowedAmount,
      availableAmount,
    };
  });

  return Promise.all(promises);
}

async function tvl() {
  const balances = {};
  const allMarkets = await fetchMetrics();

  allMarkets.forEach(market => {
    if (market.availableAmount > 0 && market.tokenId) {
      const token = `coingecko:${market.tokenId}`;
      sdk.util.sumSingleBalance(balances, token, market.availableAmount);
    }
  });

  return balances;
}

async function borrowed() {
  const balances = {};
  const allMarkets = await fetchMetrics();

  allMarkets.forEach(market => {
    if (market.borrowedAmount > 0 && market.tokenId) {
      const token = `coingecko:${market.tokenId}`;
      sdk.util.sumSingleBalance(balances, token, market.borrowedAmount);
    }
  });

  return balances;
}

module.exports = {
  xpr: {
    tvl,
    borrowed,
  },
  methodology: "TVL counts the available liquidity in each market. Borrows are counted separately."
};