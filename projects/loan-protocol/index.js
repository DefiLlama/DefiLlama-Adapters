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

async function tvl() {
  const balances = {};

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
    const totalBorrows = totalVariableBorrows + totalStableBorrows;

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
    const cashAvailable = tokenBalance ? parseAsset(tokenBalance.balance).amount : 0;
    const totalTvlAmount = totalBorrows + cashAvailable;
    const internalTokenId = `${tokenContract}:${symbol}`;

    const finalTokenId = tokenMapping[internalTokenId];

    return {
      tokenId: finalTokenId,
      amount: totalTvlAmount,
    };
  });

  const allMarketsTvl = await Promise.all(promises);

  allMarketsTvl.forEach(market => {
    if (market.amount > 0 && market.tokenId) {
      const token = `coingecko:${market.tokenId}`;
      sdk.util.sumSingleBalance(balances, token, market.amount);
    }
  });

  return balances;
}

module.exports = {
  xpr: {
    tvl,
  },
  methodology: "Counts the total assets supplied to the lending markets. TVL is calculated as the sum of all borrowed assets and all available liquidity (cash) held by the lending contract."
};